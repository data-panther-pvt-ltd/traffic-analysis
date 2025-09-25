"""
Enterprise-Level FastAPI Traffic Analysis with OpenAI Embeddings + FAISS Vector Database
Author: AI Assistant
Description: Advanced traffic analysis system using semantic search and AI-powered insights
"""

import os
import json
import asyncio
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import aiohttp
import uvicorn
import re
from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import faiss
import openai
from openai import AsyncOpenAI



# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize FastAPI backend
app = FastAPI(
    title="Traffic Analysis AI - Embeddings + Vector Search",
    description="Enterprise-level traffic analysis using OpenAI embeddings and FAISS vector database",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
CONFIG = {
    "openai_model": "text-embedding-3-small",
    "embedding_dimension": 1536,
    "faiss_index_path": "embeddings/faiss_index.bin",
    "metadata_path": "embeddings/metadata.json",
    "geojson_dir": "data/geojson",
    "top_k_results": 5,
    "max_tokens": 4000
}

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    logger.error("❌ OPEN_AI_API_KEY not found in environment variables")
    raise RuntimeError("OpenAI API key is required")
# Initialize async OpenAI client (shared across backend)
openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

# GeoJSON URLs for traffic data
# GEOJSON_URLS = {
#     "2022_Sep": "https://apps.thtc.sa/dubaidash/assets/geojson/2022/Sep/Sheikh%20Rashid%20Rd%20-%20Northbound_1.geojson",
#     "2022_Oct": "https://apps.thtc.sa/dubaidash/assets/geojson/2022/Oct/Sheikh%20Rashid%20Rd%20-%20Northbound_1.geojson",
#     "2023_Sep": "https://apps.thtc.sa/dubaidash/assets/geojson/2023/Sep/Sheikh%20Rashid%20Rd%20-%20Northbound_1.geojson",
#     "2023_Oct": "https://apps.thtc.sa/dubaidash/assets/geojson/2023/Oct/Sheikh%20Rashid%20Rd%20-%20Northbound_1.geojson"
# }

# Pydantic Models
class ChatRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5
    language: Optional[str] = "en"  # "en" for English, "ar" for Arabic

class ChatResponse(BaseModel):
    query: str
    similar_segments: List[Dict[str, Any]]
    ai_analysis: str
    search_metadata: Dict[str, Any]
    processing_time: float

class EmbeddingStatus(BaseModel):
    status: str
    total_embeddings: int
    files_processed: List[str]
    processing_time: Optional[float] = None

class HealthResponse(BaseModel):
    status: str
    embeddings_available: bool
    total_segments: int
    last_updated: Optional[str] = None

# Global variables for FAISS and metadata
faiss_index: Optional[faiss.Index] = None
segment_metadata: List[Dict[str, Any]] = []
embeddings_array_global: Optional[np.ndarray] = None

class GeoJSONProcessor:
    """Processes GeoJSON traffic data for embedding creation"""

    # ---------- Local-file cache ----------
    @staticmethod
    def _local_path(url: str) -> Path:
        parts = url.split("/")
        # Keep last 3 path components (e.g. 2023/Oct/Sheikh …geojson)
        tail = "_".join(parts[-3:]).replace(" ", "_")
        cache_dir = Path(CONFIG["geojson_dir"])
        cache_dir.mkdir(parents=True, exist_ok=True)
        return cache_dir / tail

    # ---------- Downloader ----------
    @staticmethod
    async def download_geojson(url: str, session: aiohttp.ClientSession) -> Dict[str, Any]:
        """Download GeoJSON with local-file caching."""
        local_path = GeoJSONProcessor._local_path(url)

        if local_path.exists():
            try:
                return json.loads(local_path.read_text())
            except Exception:
                logger.warning(f"⚠️ Cache file {local_path} is corrupted, redownloading…")

        try:
            async with session.get(url) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    local_path.write_text(json.dumps(data))
                    return data
                logger.error(f"Failed to download {url}: HTTP {resp.status}")
        except Exception as e:
            logger.error(f"Error downloading {url}: {e}")
        return {}

    # ---------- GeoJSON → list[segment] ----------
    @staticmethod
    def extract_traffic_segments(
        geojson_data: Dict[str, Any],
        month: str,
        year: int
    ) -> List[Dict[str, Any]]:
        """Extract traffic segments, handling both legacy and Dubai-dash schemas."""
        segments: List[Dict[str, Any]] = []
        if not geojson_data or "features" not in geojson_data:
            return segments

        for feat in geojson_data["features"]:
            if not isinstance(feat, dict):
                continue
            geom = feat.get("geometry") or {}
            prop = feat.get("properties") or {}
            if geom.get("type") != "LineString":
                continue

            # Common fields
            seg_id = prop.get("SEGMENT_ID") or prop.get("segmentId") or prop.get("newSegmentId") or "unknown"
            street = prop.get("STREET_NAME") or prop.get("streetName") or "Unknown Street"
            speed_lim = prop.get("SPEED_LIMIT") or prop.get("speedLimit") or 100
            dist = prop.get("DISTANCE") or prop.get("distance") or 0
            samples = prop.get("SAMPLE_SIZE") or prop.get("sampleSize") or 0

            avg_spd = prop.get("AVG_SPEED")
            med_spd = prop.get("MEDIAN_SPEED")
            travel_t = prop.get("AVG_TRAVEL_TIME")
            time_periods: Dict[str, Any] = {}

            # New schema
            if avg_spd is None and "segmentTimeResults" in prop:
                arr = prop["segmentTimeResults"]
                if isinstance(arr, list) and arr:
                    head = arr[0]
                    avg_spd = head.get("averageSpeed") or head.get("harmonicAverageSpeed") or 0
                    med_spd = head.get("medianSpeed") or 0
                    travel_t = head.get("averageTravelTime") or 0
                    for r in arr:
                        label = f"time_set_{r.get('timeSet', 'na')}"
                        time_periods[label] = {
                            "AVG_SPEED": r.get("averageSpeed") or r.get("harmonicAverageSpeed"),
                            "MEDIAN_SPEED": r.get("medianSpeed"),
                        }

            # Legacy schema
            if not time_periods:
                for k, v in prop.items():
                    if isinstance(k, str) and ("WD_" in k or "WE_" in k):
                        time_periods[k] = v
                avg_spd = avg_spd or prop.get("AVG_SPEED", 0)
                med_spd = med_spd or prop.get("MEDIAN_SPEED", 0)
                travel_t = travel_t or prop.get("AVG_TRAVEL_TIME", 0)

            segments.append({
                "month": month,
                "year": year,
                "segment_id": seg_id,
                "street_name": street,
                "average_speed": avg_spd or 0,
                "median_speed": med_spd or 0,
                "distance": dist,
                "sample_size": samples,
                "travel_time": travel_t or 0,
                "speed_limit": speed_lim,
                "coordinates": geom.get("coordinates") or [],
                "time_periods": time_periods,
            })

        return segments

    # ---------- Segment → text ----------
    @staticmethod
    def convert_segment_to_text(segment: Dict[str, Any]) -> str:
        """Convert traffic segment data to descriptive text for embedding"""
        month = segment['month']
        year = segment['year']
        street = segment['street_name']
        avg_speed = segment['average_speed']
        distance = segment['distance']
        sample_size = segment['sample_size']
        speed_limit = segment['speed_limit']

        # Determine congestion level
        if avg_speed >= speed_limit * 0.8:
            congestion = "minimal congestion, free-flowing traffic"
        elif avg_speed >= speed_limit * 0.6:
            congestion = "moderate congestion, steady traffic flow"
        elif avg_speed >= speed_limit * 0.4:
            congestion = "heavy congestion, slow-moving traffic"
        else:
            congestion = "severe congestion, stop-and-go traffic"

        # Base description
        text = (
            f"Traffic segment on {street} in {month} {year}. "
            f"Average speed {avg_speed:.1f} km/h on {distance:.0f}m segment with {sample_size:,} vehicle samples. "
            f"Speed limit {speed_limit} km/h indicating {congestion}. "
        )

        # Add time period information
        if segment['time_periods']:
            text += "Time period data: "
            for period, data in segment['time_periods'].items():
                if isinstance(data, dict) and 'AVG_SPEED' in data:
                    text += f"{period.replace('_', ' ')}: {data['AVG_SPEED']:.1f} km/h, "

        # Normalise whitespace and remove redundant commas
        return " ".join(text.strip().split())



# ---- QueryParser and months ----
MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

class QueryParser:
    """Very small rule‑based parser for month/year, weekday/weekend, and hour ranges."""
    @staticmethod
    def parse(q: str) -> Dict[str, Any]:
        out: Dict[str, Any] = {}

        # Month + Year like 'Sep 2022'
        for mo, yr in re.findall(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[ ,]*(20\d{2})", q, re.I):
            out.setdefault("filters", []).append({"month": mo[:3], "year": int(yr)})

        # Weekday / Weekend
        if re.search(r"week\s*days?", q, re.I):
            out["day_type"] = "weekday"
        elif re.search(r"week\s*ends?", q, re.I):
            out["day_type"] = "weekend"

        # Hour range e.g. '7 AM to 9 AM'
        m = re.search(r"(\d{1,2})\s*([AP]M).{0,10}(?:to|-|–)\s*(\d{1,2})\s*([AP]M)", q, re.I)
        if m:
            h1,p1,h2,p2 = m.groups()
            def _24(h,p): return (int(h)%12) + (12 if p.upper()=="PM" else 0)
            out["hours"] = (_24(h1,p1), _24(h2,p2))

        return out


class EmbeddingManager:
    """Manages OpenAI embeddings creation and processing"""

    @staticmethod
    async def create_embedding(text: str) -> List[float]:
        """Create embedding for given text using OpenAI API"""
        try:
            response = await openai_client.embeddings.create(
                model=CONFIG["openai_model"],
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.warning(f"Error creating embedding: {str(e)}")
            return []

    @staticmethod
    async def create_embeddings_batch(texts: List[str], batch_size: int = 96) -> List[List[float]]:
        """
        Create embeddings in larger batches (OpenAI accepts multiple inputs in one call).
        """
        embeddings: List[List[float]] = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            try:
                response = await openai_client.embeddings.create(
                    model=CONFIG["openai_model"],
                    input=batch
                )
                batch_embeddings = [d.embedding for d in response.data]
                embeddings.extend(batch_embeddings)
            except Exception as e:
                logger.error(f"Error creating batch embeddings: {str(e)}")
                # Fallback to single‑item processing when batch fails
                for text in batch:
                    single = await EmbeddingManager.create_embedding(text)
                    embeddings.append(single if single else [0.0] * CONFIG["embedding_dimension"])

            # Small pause to respect rate limits
            await asyncio.sleep(0.2)

        return embeddings

class FAISSManager:
    """Manages FAISS vector database operations"""
    
    @staticmethod
    def create_index(dimension: int) -> faiss.Index:
        """Create a backend FAISS index"""
        index = faiss.IndexFlatIP(dimension)  # Inner product for cosine similarity
        return index
    
    @staticmethod
    def add_embeddings(index: faiss.Index, embeddings: np.ndarray) -> None:
        """Add embeddings to FAISS index"""
        # Normalize for cosine similarity
        faiss.normalize_L2(embeddings)
        index.add(embeddings)
    
    @staticmethod
    def search_similar(index: faiss.Index, query_embedding: np.ndarray, k: int = 5) -> Tuple[np.ndarray, np.ndarray]:
        """Search for similar embeddings"""
        # Normalize query embedding
        faiss.normalize_L2(query_embedding)
        scores, indices = index.search(query_embedding, k)
        return scores, indices
    
    @staticmethod
    def save_index(index: faiss.Index, filepath: str) -> None:
        """Save FAISS index to disk"""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        faiss.write_index(index, filepath)
    
    @staticmethod
    def load_index(filepath: str) -> Optional[faiss.Index]:
        """Load FAISS index from disk"""
        try:
            if os.path.exists(filepath):
                return faiss.read_index(filepath)
            return None
        except Exception as e:
            logger.error(f"Error loading FAISS index: {str(e)}")
            return None

class OpenAIResponseGenerator:
    """Generates AI responses using OpenAI ChatCompletion"""

    @staticmethod
    async def generate_traffic_analysis(query: str, similar_segments: List[Dict[str, Any]], language: str = "en") -> str:
        """Generate traffic analysis using OpenAI ChatCompletion."""

        if language == "ar":
            context = "بيانات المرور ذات الصلة:\n"
            for i, segment in enumerate(similar_segments, 1):
                context += f"\n{i}. {segment['month']} {segment['year']} - {segment['street_name']}\n"
                context += f"   متوسط السرعة: {segment['average_speed']:.1f} كم/س، المسافة: {segment['distance']:.0f}م\n"

            system_prompt = (
                "أنت مساعد مروري في دبي مفيد ومعتمد على البيانات. "
                "استخدم السياق المقدم للإجابة على استفسار المستخدم المتعلق بالمرور. "
                "اجب برؤى قابلة للتطبيق ونقاط قصيرة تبدأ بـ '*'. "
                "يجب أن تكون إجابتك باللغة العربية."
            )
            user_prompt = (
                f"{context}\n\n"
                f"سؤال المستخدم: {query}\n\n"
                f"الجواب:"
            )
        else:
            context = "RELEVANT TRAFFIC DATA:\n"
            for i, segment in enumerate(similar_segments, 1):
                context += f"\n{i}. {segment['month']} {segment['year']} - {segment['street_name']}\n"
                context += f"   Avg Speed: {segment['average_speed']:.1f} km/h, Distance: {segment['distance']:.0f}m\n"

            system_prompt = (
                "You are a helpful and data-driven Dubai traffic assistant. "
                "Use the provided context to answer the user's traffic-related query. "
                "Respond with actionable insights and short bullet points starting with '*'."
            )
            user_prompt = (
                f"{context}\n\n"
                f"User Question: {query}\n\n"
                f"Answer:"
            )

        try:
            chat = await openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=CONFIG["max_tokens"]
            )
            return chat.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error generating OpenAI chat response: {str(e)}")
            if language == "ar":
                return "غير قادر على إنشاء التحليل في هذا الوقت."
            return "Unable to generate analysis at this time."

# Initialize components on startup
async def load_embeddings():
    """Load FAISS index and metadata on startup"""
    global faiss_index, segment_metadata
    
    try:
        # Load FAISS index
        faiss_index = FAISSManager.load_index(CONFIG["faiss_index_path"])
        
        # Load metadata
        if os.path.exists(CONFIG["metadata_path"]):
            with open(CONFIG["metadata_path"], 'r') as f:
                segment_metadata = json.load(f)
        
        if faiss_index and segment_metadata:
            logger.info(f"✅ Loaded {len(segment_metadata)} embeddings from FAISS database")
            global embeddings_array_global
            embeddings_array_global = np.array(
                [faiss_index.reconstruct(i) for i in range(faiss_index.ntotal)],
                dtype=np.float32
            )
        else:
            logger.warning("⚠️ No existing embeddings found. Use /create-embeddings to build database.")
            
    except Exception as e:
        logger.error(f"❌ Error loading embeddings: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Initialize the application"""
    logger.info("🚀 Starting Traffic Analysis AI with Embeddings...")
    await load_embeddings()

# API Endpoints

@app.get("/", response_model=Dict[str, Any])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Traffic Analysis AI - Embeddings + Vector Search",
        "version": "2.0.0",
        "status": "active",
        "endpoints": {
            "/create-embeddings": "POST - Create embeddings from GeoJSON files (one-time setup)",
            "/chat": "POST - Query traffic data using natural language",
            "/health": "GET - System health check",
            "/embeddings/info": "GET - Embedding database statistics"
        },
        "features": [
            "OpenAI Embeddings with semantic search",
            "FAISS vector database for fast similarity search",
            "Multi-temporal traffic data (2022-2023)"
        ]
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    global faiss_index, segment_metadata
    
    embeddings_available = faiss_index is not None and len(segment_metadata) > 0
    
    return HealthResponse(
        status="healthy",
        embeddings_available=embeddings_available,
        total_segments=len(segment_metadata),
        last_updated=datetime.now().isoformat() if embeddings_available else None
    )

@app.get("/embeddings/info", response_model=Dict[str, Any])
async def embeddings_info():
    """Get information about the embedding database"""
    global faiss_index, segment_metadata
    
    if not faiss_index or not segment_metadata:
        raise HTTPException(status_code=404, detail="Embeddings database not found. Create embeddings first.")
    
    # Analyze metadata
    months = set()
    years = set()
    streets = set()
    
    for segment in segment_metadata:
        months.add(segment.get('month', 'Unknown'))
        years.add(segment.get('year', 0))
        streets.add(segment.get('street_name', 'Unknown'))
    
    return {
        "total_segments": len(segment_metadata),
        "embedding_dimension": CONFIG["embedding_dimension"],
        "available_months": sorted(list(months)),
        "available_years": sorted(list(years)),
        "streets_covered": sorted(list(streets)),
        "index_size": faiss_index.ntotal,
        "database_files": {
            "faiss_index": os.path.exists(CONFIG["faiss_index_path"]),
            "metadata": os.path.exists(CONFIG["metadata_path"])
        }
    }

@app.post("/create-embeddings", response_model=EmbeddingStatus)
async def create_embeddings_endpoint(
    background_tasks: BackgroundTasks,
    files: List[str] = Query(
        ...,
        title="File URLs",
        description="List of GeoJSON File URLs in Sequential order (e.g. Sep_2022.geojson)"
    ),
    file_keys: Optional[List[str]] = Query(
        None,
        title="Optional file keys",
        description="Optional custom keys like '2022_Sep'. If not provided, keys will be auto-generated."
    )
):
    """Create embeddings from GeoJSON files (dynamic URLs)"""
    global faiss_index, segment_metadata

    start_time = datetime.now()
    logger.info("🔄 Starting embedding creation process...")

    try:
        all_segments = []
        processed_files = []

        if file_keys and len(file_keys) != len(files):
            raise ValueError("Number of file_keys must match number of files")

        async with aiohttp.ClientSession() as session:
            for i, url in enumerate(files):
                key = file_keys[i] if file_keys else f"file_{i+1}"
                logger.info(f"📥 Downloading {key} from {url}...")

                # Extract month/year if in key
                try:
                    year, month = key.split('_')
                    year = int(year)
                except ValueError:
                    logger.warning(f"⚠️ Unable to extract year/month from key: {key}. Skipping.")
                    continue

                # Download GeoJSON
                geojson_data = await GeoJSONProcessor.download_geojson(url, session)

                if geojson_data:
                    segments = GeoJSONProcessor.extract_traffic_segments(geojson_data, month, year)
                    all_segments.extend(segments)
                    processed_files.append(key)
                    logger.info(f"✅ Processed {len(segments)} segments from {key}")
                else:
                    logger.warning(f"⚠️ Failed to process {key}")
        
        if not all_segments:
            raise HTTPException(status_code=500, detail="No traffic segments found in GeoJSON files")
        
        logger.info(f"📊 Total segments to process: {len(all_segments)}")
        
        # Convert segments to text for embedding
        logger.info("📝 Converting segments to text...")
        texts = []
        for segment in all_segments:
            text = GeoJSONProcessor.convert_segment_to_text(segment)
            texts.append(text)
        
        # Create embeddings
        logger.info("🤖 Creating embeddings with OpenAI...")
        embeddings = await EmbeddingManager.create_embeddings_batch(texts)
        
        if len(embeddings) != len(all_segments):
            logger.warning(f"⚠️ Embedding count mismatch: {len(embeddings)} vs {len(all_segments)}")
        
        # Create FAISS index
        logger.info("🗄️ Building FAISS vector database...")
        index = FAISSManager.create_index(CONFIG["embedding_dimension"])
        embeddings_array = np.array(embeddings, dtype=np.float32)
        global embeddings_array_global
        embeddings_array_global = embeddings_array
        FAISSManager.add_embeddings(index, embeddings_array)
        
        # Save to disk
        logger.info("💾 Saving embeddings to disk...")
        FAISSManager.save_index(index, CONFIG["faiss_index_path"])
        
        # Save metadata
        with open(CONFIG["metadata_path"], 'w') as f:
            json.dump(all_segments, f, indent=2)
        
        # Update global variables
        faiss_index = index
        segment_metadata = all_segments
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ Embedding creation completed in {processing_time:.2f} seconds")
        
        return EmbeddingStatus(
            status="success",
            total_embeddings=len(embeddings),
            files_processed=processed_files,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"❌ Error creating embeddings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create embeddings: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint for traffic queries with semantic search"""
    global faiss_index, segment_metadata

    start_time = datetime.now()

    # Check if embeddings are available
    if not faiss_index or not segment_metadata:
        raise HTTPException(
            status_code=404,
            detail="Embeddings database not found. Please create embeddings first using /create-embeddings"
        )

    try:
        logger.info(f"🔍 Processing query: {request.query}")

        # ---- metadata filters based on user query ----
        qp = QueryParser.parse(request.query)
        candidate_ids = list(range(len(segment_metadata)))

        # Month / Year filters
        if "filters" in qp:
            allowed = set()
            for f in qp["filters"]:
                for idx, seg in enumerate(segment_metadata):
                    if seg["month"].startswith(f["month"]) and seg["year"] == f["year"]:
                        allowed.add(idx)
            candidate_ids = list(allowed) if allowed else candidate_ids

        # Day‑type filter
        if "day_type" in qp:
            key_prefix = "WD_" if qp["day_type"] == "weekday" else "WE_"
            candidate_ids = [
                idx for idx in candidate_ids
                if any(key_prefix in k for k in segment_metadata[idx].get("time_periods", {}))
            ] or candidate_ids

        # Create embedding for user query
        query_embedding = await EmbeddingManager.create_embedding(request.query)

        if not query_embedding:
            raise HTTPException(status_code=500, detail="Failed to create query embedding")

        # Build a tiny sub‑index for the candidate set
        query_array = np.array([query_embedding], dtype=np.float32)

        # Build a tiny sub‑index for the candidate set
        sub_index = FAISSManager.create_index(CONFIG["embedding_dimension"])
        sub_vectors = np.array([embeddings_array_global[i] for i in candidate_ids], dtype=np.float32)
        FAISSManager.add_embeddings(sub_index, sub_vectors)

        scores, local_indices = FAISSManager.search_similar(sub_index, query_array, request.top_k)
        # Map local indices back to absolute IDs
        indices = [[candidate_ids[i] for i in local_indices[0]]]

        # Retrieve similar segments with metadata
        similar_segments = []
        for i, idx in enumerate(indices[0]):
            if idx < len(segment_metadata):
                segment = segment_metadata[idx].copy()
                segment['similarity_score'] = float(scores[0][i])
                similar_segments.append(segment)

        # Generate AI analysis using OpenAI Chat
        logger.info("🧠 Generating AI analysis...")
        ai_analysis = await OpenAIResponseGenerator.generate_traffic_analysis(
            request.query,
            similar_segments,
            request.language
        )

        processing_time = (datetime.now() - start_time).total_seconds()

        logger.info(f"✅ Query processed in {processing_time:.2f} seconds")

        return ChatResponse(
            query=request.query,
            similar_segments=similar_segments,
            ai_analysis=ai_analysis,
            search_metadata={
                "total_segments_searched": len(segment_metadata),
                "top_k_returned": len(similar_segments),
                "average_similarity": float(np.mean(scores[0])) if len(scores[0]) > 0 else 0.0,
                "search_method": "FAISS cosine similarity"
            },
            processing_time=processing_time
        )

    except Exception as e:
        logger.error(f"❌ Error processing chat query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process query: {str(e)}")


@app.post("/retrieve")
async def retrieve_chunks(query: str, top_k: int = 5):
    """
    Retrieve top-k most similar traffic chunks based on query.
    """
    global faiss_index, segment_metadata, embeddings_array_global

    if not faiss_index or not segment_metadata:
        raise HTTPException(
            status_code=404,
            detail="Embeddings database not found. Please create embeddings first using /create-embeddings"
        )

    try:
        logger.info(f"🔍 Retrieving chunks for query: {query}")

        # Create embedding for the query
        query_embedding = await EmbeddingManager.create_embedding(query)
        if not query_embedding:
            raise HTTPException(status_code=500, detail="Failed to create query embedding")

        query_array = np.array([query_embedding], dtype=np.float32)

        # Perform search
        scores, indices = FAISSManager.search_similar(faiss_index, query_array, top_k)
        top_indices = indices[0]
        top_scores = scores[0]

        # Fetch segments and add score
        results = []
        for i, idx in enumerate(top_indices):
            if idx < len(segment_metadata):
                seg = segment_metadata[idx].copy()
                seg['similarity_score'] = float(top_scores[i])
                results.append(seg)

        return {"query": query, "results": results}

    except Exception as e:
        logger.exception("❌ Error in retrieval")
        raise HTTPException(status_code=500, detail=str(e))

