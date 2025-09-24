import streamlit as st
import requests
import json
import os
from typing import List, Dict, Any

# Configuration
API_BASE_URL = "http://localhost:8000"  # Default FastAPI server URL


def set_page_config():
    st.set_page_config(
        page_title="Dubai Traffic Analysis AI",
        page_icon="🚗",
        layout="wide"
    )


def display_health_check():
    """Display system health and database information"""
    try:
        health_response = requests.get(f"{API_BASE_URL}/health")
        embeddings_info = requests.get(f"{API_BASE_URL}/embeddings/info")

        if health_response.status_code == 200 and embeddings_info.status_code == 200:
            health_data = health_response.json()
            info_data = embeddings_info.json()

            st.sidebar.success("✅ System Health: Operational")
            st.sidebar.write("### Embeddings Database")
            st.sidebar.write(f"**Total Segments:** {info_data['total_segments']}")
            st.sidebar.write(f"**Available Years:** {', '.join(map(str, info_data['available_years']))}")
            st.sidebar.write(f"**Available Months:** {', '.join(info_data['available_months'])}")
    except requests.exceptions.ConnectionError:
        st.sidebar.error("❌ Cannot connect to API. Ensure FastAPI server is running.")


def configure_api_endpoint():
    """Allow users to configure the API endpoint"""
    global API_BASE_URL  # Declare first before using or assigning

    st.sidebar.header("⚙️ API Configuration")
    api_url = st.sidebar.text_input(
        "FastAPI Server URL",
        value=API_BASE_URL,
        help="Enter the base URL of your FastAPI server"
    )

    if st.sidebar.button("Update API Endpoint"):
        API_BASE_URL = api_url
        st.sidebar.success(f"API Endpoint set to: {API_BASE_URL}")



def chatbot_section():
    """Streamlit Chatbot using chat_input and /chat API"""
    st.header("💬 Traffic Chatbot Assistant")

    # Language selection
    col1, col2 = st.columns([3, 1])
    with col2:
        language = st.selectbox(
            "Language / اللغة",
            options=["en", "ar"],
            format_func=lambda x: "English 🇬🇧" if x == "en" else "العربية 🇦🇪",
            key="chat_language"
        )

    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []

    # Display previous messages
    for message in st.session_state.chat_history:
        with st.chat_message(message["role"]):
            if message.get("language") == "ar":
                st.markdown(f'<div dir="rtl">{message["content"]}</div>', unsafe_allow_html=True)
            else:
                st.markdown(message["content"])

    # Chat input at bottom

    st.markdown("""
        <style>
        /* Target main block, keep input inside main container */
        section.main > div:has(.stChatInput) {
            padding-bottom: 70px; /* space for chat input */
        }

        .stChatInput {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            max-width: 1200px !important; /* same as Streamlit main content */
            margin: 0 auto !important;
            z-index: 1000 !important;
            background-color: white !important;
            padding: 10px 16px !important;
            border-top: 1px solid #e0e0e0 !important;
            box-sizing: border-box !important;
        }

        .stChatInput > div {
            margin: 0 !important;
        }

        @media (max-width: 768px) {
            .stChatInput {
                max-width: 100% !important;
                padding: 10px !important;
            }
        }
        </style>
    """, unsafe_allow_html=True)

    # Dynamic prompt based on language
    prompt_placeholder = "Ask about traffic..." if language == "en" else "اسأل عن المرور..."
    prompt = st.chat_input(prompt_placeholder)

    if prompt:
        # Show user message
        st.session_state.chat_history.append({"role": "user", "content": prompt, "language": language})
        with st.chat_message("user"):
            if language == "ar":
                st.markdown(f'<div dir="rtl">{prompt}</div>', unsafe_allow_html=True)
            else:
                st.markdown(prompt)

        # Show AI thinking
        with st.chat_message("assistant"):
            thinking_text = "Thinking..." if language == "en" else "جاري التفكير..."
            with st.spinner(thinking_text):
                try:
                    response = requests.post(
                        f"{API_BASE_URL}/chat",
                        json={"query": prompt, "top_k": 5, "language": language}
                    )
                    if response.status_code == 200:
                        result = response.json()
                        ai_message = result.get("ai_analysis", "No analysis returned.")
                    else:
                        ai_message = f"❌ API Error: {response.text}"
                except Exception as e:
                    ai_message = f"❌ Exception: {e}"

                if language == "ar":
                    st.markdown(f'<div dir="rtl">{ai_message}</div>', unsafe_allow_html=True)
                else:
                    st.markdown(ai_message)
                st.session_state.chat_history.append({"role": "assistant", "content": ai_message, "language": language})



def create_embeddings_section():
    """Section for creating embeddings from GeoJSON files"""
    st.header("🌐 Create Traffic Embeddings")

    num_files = st.number_input("Number of GeoJSON Files", min_value=1, max_value=10, value=1)
    file_inputs = []
    file_keys = []

    for i in range(num_files):
        col1, col2 = st.columns(2)
        with col1:
            file_url = st.text_input(f"GeoJSON File URL {i + 1}", key=f"file_url_{i}")
        with col2:
            file_key = st.text_input(f"File Key (e.g., 2022_Sep) {i + 1}", key=f"file_key_{i}")

        if file_url:
            file_inputs.append(file_url)
        if file_key:
            file_keys.append(file_key)

    if st.button("Create Embeddings", type="primary"):
        with st.spinner("Creating embeddings... This might take a few minutes."):
            try:
                params = {"files": file_inputs}
                if file_keys:
                    params["file_keys"] = file_keys

                response = requests.post(f"{API_BASE_URL}/create-embeddings", params=params)

                if response.status_code == 200:
                    result = response.json()
                    st.success(f"✅ Embeddings created successfully!")
                    st.json(result)
                else:
                    st.error(f"❌ Error creating embeddings: {response.text}")
            except Exception as e:
                st.error(f"❌ Error: {str(e)}")


def retrieve_chunks_section():
    """Simple top-k chunk retriever using the /retrieve endpoint"""
    st.header("🔍 Retrieve Similar Traffic Segments")

    query = st.text_area("Enter your query for retrieval", placeholder="e.g., Traffic during Expo 2020 near Dubai Marina")
    top_k = st.slider("Number of segments", 1, 10, 5)

    if st.button("Retrieve", key="retriever"):
        if query:
            with st.spinner("Retrieving similar chunks..."):
                try:
                    response = requests.post(
                        f"{API_BASE_URL}/retrieve",
                        params={"query": query, "top_k": top_k}
                    )
                    if response.status_code == 200:
                        result = response.json()
                        st.subheader("📍 Retrieved Segments")
                        for seg in result['results']:
                            with st.expander(f"{seg['street_name']} - {seg['month']} {seg['year']}"):
                                col1, col2, col3 = st.columns(3)
                                with col1:
                                    st.metric("Avg Speed", f"{seg['average_speed']} km/h")
                                with col2:
                                    st.metric("Distance", f"{seg['distance']} m")
                                with col3:
                                    st.metric("Similarity", f"{seg['similarity_score']:.2f}")
                        st.subheader("📎 Raw Response")
                        st.json(result)
                    else:
                        st.error(f"❌ Retrieval failed: {response.text}")
                except Exception as e:
                    st.error(f"❌ Exception: {e}")
        else:
            st.warning("Please enter a query.")


def main():
    set_page_config()

    st.title("🚦 Dubai Traffic Analysis AI")
    st.markdown("""
    An advanced AI-powered system for semantic traffic data analysis using:
    - OpenAI Embeddings
    - FAISS Vector Database
    - Natural Language Querying
    """)

    # Sidebar config
    configure_api_endpoint()
    display_health_check()

    # Tabs
    tab1, tab2, tab3 = st.tabs(["💬 Chatbot Assistant", "📡 Create Embeddings", "🔍 Retrieve Chunks"])

    with tab1:
        chatbot_section()

    with tab2:
        create_embeddings_section()

    with tab3:
        retrieve_chunks_section()


if __name__ == "__main__":
    main()
