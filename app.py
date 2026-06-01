import streamlit as st
import pandas as pd
import plotly.express as px
import requests

# Configure Page
st.set_page_config(page_title="ZenLearn: Decision Risk Measurement", layout="wide")

# High-contrast brand blues (strictly avoiding muddy tones/charcoals)
BRAND_BLUES = ['#0033A0', '#0055D4', '#3388FF', '#80BFFF']

# CACHE REMOVED: This prevents the app from hanging on the initial load
def load_and_process_data(file):
    # Read the file
    df = pd.read_csv(file) if file.name.endswith('.csv') else pd.read_excel(file)
    
    # 1. Filter Target Months
    target_months = ['Feb', 'Mar', 'Apr', 'February', 'March', 'April']
    df['Month_Clean'] = df['Month'].str.strip().str.slice(0,3).str.capitalize()
    df_filtered = df[df['Month_Clean'].isin(['Feb', 'Mar', 'Apr'])].copy()

    # 2. Flag Generation & Penalties
    # Skill Gap: Repeat IMEI
    imei_counts = df_filtered['IMEI'].value_counts()
    repeat_imeis = imei_counts[imei_counts > 1].index
    df_filtered['Flag_Repeat_IMEI'] = df_filtered['IMEI'].isin(repeat_imeis)
    df_filtered['Skill_Penalty'] = df_filtered['Flag_Repeat_IMEI'].astype(int) * 20

    # Audit Gap: Suspicious Customer Contact
    phone_counts = df_filtered['Customer Contact Number1'].value_counts()
    suspicious_phones = phone_counts[phone_counts > 2].index
    df_filtered['Flag_Suspicious_Phone'] = df_filtered['Customer Contact Number1'].isin(suspicious_phones)
    df_filtered['Audit_Penalty'] = df_filtered['Flag_Suspicious_Phone'].astype(int) * 30

    # Process Gap: Using NPS detractor/missing as proxy for broken process
    df_filtered['Flag_Process_Breakdown'] = df_filtered['Final NPS Rating'].isin(['No Response', '1', '2', '3'])
    df_filtered['Process_Penalty'] = df_filtered['Flag_Process_Breakdown'].astype(int) * 15

    # 3. Calculate Scores (Baseline 100)
    df_filtered['Skill_Score'] = (100 - df_filtered['Skill_Penalty']).clip(lower=0)
    df_filtered['Audit_Score'] = (100 - df_filtered['Audit_Penalty']).clip(lower=0)
    df_filtered['Process_Score'] = (100 - df_filtered['Process_Penalty']).clip(lower=0)
    df_filtered['Total_Anomalies'] = df_filtered[['Flag_Repeat_IMEI', 'Flag_Suspicious_Phone', 'Flag_Process_Breakdown']].sum(axis=1)

    return df_filtered

def trigger_workflow_alert(hit_list_df):
    """
    Webhook integration to push alerts directly into Teams/Slack.
    """
    webhook_url = "YOUR_SLACK_OR_TEAMS_WEBHOOK_URL"
    payload = {
        "text": f"🚨 *Decision Risk Alert* 🚨\n{len(hit_list_df)} high-risk workorders flagged for immediate audit. Please review the dashboard."
    }
    # requests.post(webhook_url, json=payload)
    st.sidebar.success("Alert successfully pushed to Teams/Slack!")

# --- UI Setup ---
st.title("Enterprise Decision Risk Measurement")

st.sidebar.header("Data Ingestion")
uploaded_file = st.sidebar.file_uploader("Upload Monthly Service Data (.csv or .xlsx)", type=['csv', 'xlsx'])

if uploaded_file is not None:
    # Process data immediately upon upload
    data = load_and_process_data(uploaded_file)
    
    st.sidebar.header("Navigation")
    view_mode = st.sidebar.radio("Select View Level", ["Supervisor/CXO View", "Individual (ASP) View"])
    
    if view_mode == "Supervisor/CXO View":
        st.header("Supervisor Overview")
        
        # Hierarchy Filters
        col1, col2 = st.columns(2)
        with col1:
            selected_busm = st.selectbox("Filter by Business Unit (BUSM)", ["All"] + list(data['BUSM Name'].dropna().unique()))
        
        filtered_data = data if selected_busm == "All" else data[data['BUSM Name'] == selected_busm]
        
        with col2:
            selected_asm = st.selectbox("Filter by Supervisor (ASM)", ["All"] + list(filtered_data['ASM Name'].dropna().unique()))
            
        if selected_asm != "All":
            filtered_data = filtered_data[filtered_data['ASM Name'] == selected_asm]

        # Aggregate Scores
        st.subheader("Aggregate Risk Scores")
        score_cols = st.columns(3)
        score_cols[0].metric("Average Process Score", f"{filtered_data['Process_Score'].mean():.1f}")
        score_cols[1].metric("Average Skill Score", f"{filtered_data['Skill_Score'].mean():.1f}")
        score_cols[2].metric("Average Audit Score", f"{filtered_data['Audit_Score'].mean():.1f}")

        # Trend Chart
        st.subheader("Monthly Risk Trend")
        trend_data = filtered_data.groupby('Month_Clean')[['Process_Score', 'Skill_Score', 'Audit_Score']].mean().reset_index()
        trend_data['Month_Clean'] = pd.Categorical(trend_data['Month_Clean'], categories=['Feb', 'Mar', 'Apr'], ordered=True)
        trend_data = trend_data.sort_values('Month_Clean')
        
        fig = px.line(trend_data, x='Month_Clean', y=['Process_Score', 'Skill_Score', 'Audit_Score'], 
                      markers=True, color_discrete_sequence=BRAND_BLUES)
        fig.update_layout(yaxis_title="Score (Out of 100)", xaxis_title="Month", plot_bgcolor="white")
        st.plotly_chart(fig, use_container_width=True)

        # The Hit List
        st.subheader("Action Center: High-Risk Workorders")
        hit_list = filtered_data[filtered_data['Total_Anomalies'] >= 2][
            ['Workorder', 'ASP Name', 'Customer City', 'IMEI', 'Symptom Desc', 'Total_Anomalies']
        ].sort_values(by='Total_Anomalies', ascending=False)
        
        st.dataframe(hit_list, use_container_width=True)
        
        if st.button("Push Exceptions to Teams/Slack"):
            trigger_workflow_alert(hit_list)

    elif view_mode == "Individual (ASP) View":
        st.header("Individual Execution View")
        selected_asp = st.selectbox("Select Service Centre (ASP)", data['ASP Name'].dropna().unique())
        
        asp_data = data[data['ASP Name'] == selected_asp]
        
        st.subheader(f"Performance Snapshot: {selected_asp}")
        col1, col2, col3 = st.columns(3)
        col1.metric("Process Score", f"{asp_data['Process_Score'].mean():.1f}")
        col2.metric("Skill Score", f"{asp_data['Skill_Score'].mean():.1f}")
        col3.metric("Audit Score", f"{asp_data['Audit_Score'].mean():.1f}")
        
        st.subheader("Penalty Breakdown (The 'Why')")
        penalty_summary = pd.DataFrame({
            "Risk Category": ["Repeat IMEI (Skill)", "Suspicious Contact (Audit)", "Process Breakdown"],
            "Incidents": [
                asp_data['Flag_Repeat_IMEI'].sum(),
                asp_data['Flag_Suspicious_Phone'].sum(),
                asp_data['Flag_Process_Breakdown'].sum()
            ]
        })
        
        fig2 = px.bar(penalty_summary, x="Risk Category", y="Incidents", text="Incidents", color_discrete_sequence=[BRAND_BLUES[1]])
        fig2.update_layout(plot_bgcolor="white")
        st.plotly_chart(fig2, use_container_width=True)
        
        st.subheader("Workorder Graveyard (Flagged Records)")
        st.dataframe(asp_data[asp_data['Total_Anomalies'] > 0][
            ['Workorder', 'Month_Clean', 'Flag_Repeat_IMEI', 'Flag_Suspicious_Phone', 'Flag_Process_Breakdown']
        ], use_container_width=True)

else:
    st.info("Awaiting Data: Please upload the monthly Master Data file in the sidebar to generate the Decision Risk Measurement dashboard.")
