import streamlit as st
import base64
import os
from dotenv import load_dotenv
import requests
import tempfile

# Load environment variables from .env file
load_dotenv()

# Fetch API key from environment variable
api_key = os.getenv("ON_DEMAND_API_KEY")
external_user_id = "your_external_user_id"  # Replace with your external user ID

# Sample prompt for analysis
sample_prompt = """You are a medical practitioner and an expert in analyzing medical-related images working for a reputed hospital. You will be provided with images, and you need to identify the anomalies, diseases, or health issues. Write all findings, next steps, and recommendations in detail. If the image is unclear, state 'Unable to determine based on the provided image.' Include the disclaimer: 'Consult with a Doctor before making any decisions.'"""

# Initialize session state variables
if 'uploaded_file' not in st.session_state:
    st.session_state.uploaded_file = None
if 'result' not in st.session_state:
    st.session_state.result = None

def encode_image(image_path):
    """Encode the image to base64."""
    with open(image_path, "rb") as image_file:
        encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
        print(f"Encoded Image Length: {len(encoded_image)}")  # Debugging line
        return encoded_image

def create_chat_session():
    """Create a chat session with the on-demand API."""
    create_session_url = 'https://api.on-demand.io/chat/v1/sessions'
    create_session_headers = {
        'apikey': api_key
    }
    create_session_body = {
        'pluginIds': [],
        'externalUserId': external_user_id
    }

    response = requests.post(create_session_url, headers=create_session_headers, json=create_session_body)
    if response.status_code != 201:
        print(f"Error creating session: {response.status_code} - {response.text}")
        return None
    return response.json()['data']['id']

def call_gpt4o_model_for_analysis(filename: str):
    """Call the GPT-4-O model for image analysis."""
    base64_image = encode_image(filename)

    # Create a new chat session
    session_id = create_chat_session()
    if not session_id:
        return "Unable to create chat session."

    print(f"Session ID: {session_id}")  # Debugging line

    # Submit the query for image analysis
    submit_query_url = f'https://api.on-demand.io/chat/v1/sessions/{session_id}/query'
    submit_query_headers = {
        'apikey': api_key
    }
    submit_query_body = {
        'endpointId': 'predefined-openai-gpt4o',
        'query': sample_prompt,
        'pluginIds': ['plugin-1712327325', 'plugin-1713962163'],
        'responseMode': 'sync',
        'image': base64_image
    }

    # Make the request and get the response
    query_response = requests.post(submit_query_url, headers=submit_query_headers, json=submit_query_body)

    if query_response.status_code != 200:
        print(f"Error: {query_response.status_code} - {query_response.text}")  # Print the error message
        return "An error occurred during analysis."
    
    return query_response.json()['data']['answer']  # Get the answer directly


# Streamlit app structure
st.set_page_config(page_title="Medical Image Analysis", page_icon="🩺")

# Font Preload (HTML can be included in Streamlit using st.markdown)
st.markdown(
    """
    <link rel="preload" href="http://localhost:8501/static/media/SourceSansPro-Regular.0d69e5ff5e92ac64a0c9.woff2" as="font" type="font/woff2" crossorigin="anonymous">
    <link rel="preload" href="http://localhost:8501/static/media/SourceSansPro-Bold.118dea98980e20a81ced.woff2" as="font" type="font/woff2" crossorigin="anonymous">
    <link rel="preload" href="http://localhost:8501/static/media/SourceSansPro-SemiBold.abed79cd0df1827e18cf.woff2" as="font" type="font/woff2" crossorigin="anonymous">
    """,
    unsafe_allow_html=True
)

st.title("Medical Image Analysis")

uploaded_file = st.file_uploader("Upload an Image", type=["jpg", "jpeg", "png"])

# Temporary file handling
if uploaded_file is not None:
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(uploaded_file.name)[1]) as tmp_file:
        tmp_file.write(uploaded_file.getvalue())
        st.session_state['filename'] = tmp_file.name

    st.image(uploaded_file, caption='Uploaded Image')

# Analyze Image Button
if st.button('Analyze Image'):
    if 'filename' in st.session_state and os.path.exists(st.session_state['filename']):
        st.session_state['result'] = call_gpt4o_model_for_analysis(st.session_state['filename'])
        st.markdown(st.session_state['result'], unsafe_allow_html=True)
        os.unlink(st.session_state['filename'])  # Delete the temp file after processing
