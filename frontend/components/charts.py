import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import networkx as nx
import pandas as pd
from typing import Dict, Any, List


def render_velocity_curve(velocity_data: Dict[str, Any] = None):
    """
    Renders an enterprise-grade dual-metric OSINT telemetry chart for temporal velocity 
    and cumulative reach tracking.
    """
    if not velocity_data or not velocity_data.get("timeline_hours"):
        # Industrial default fallback telemetry curve
        hours = [f"{i:02d}:00" for i in range(24)]
        volume = [int(100 * (i + 1) * (25 - i) / 10) for i in range(24)]
        delta = [int(v * 0.2) for v in volume]
    else:
        hours = velocity_data.get("timeline_hours", [])
        volume = velocity_data.get("engagement_volume", [])
        delta = velocity_data.get("hourly_velocity_delta", [0] * len(hours))

    # Create subplot with secondary y-axis for acceleration velocity delta
    fig = make_subplots(specs=[[{"secondary_y": True}]])

    # Trace 1: Cumulative Engagement Volume / Reach
    fig.add_trace(
        go.Scatter(
            x=hours, 
            y=volume,
            name="Cumulative Mentions / Reach",
            mode="lines+markers",
            line=dict(color="#FF4B4B", width=3),
            marker=dict(size=6, color="#FF4B4B")
        ),
        secondary_y=False,
    )

    # Trace 2: Hourly Velocity Delta (Acceleration/Deceleration dVol/dt)
    fig.add_trace(
        go.Bar(
            x=hours, 
            y=delta,
            name="Hourly Velocity Delta (dVol/dt)",
            marker=dict(color="rgba(31, 119, 180, 0.6)")
        ),
        secondary_y=True,
    )

    fig.update_layout(
        title="Real-Time OSINT Temporal Propagation & Acceleration Matrix",
        xaxis_title="24-Hour Observation Window",
        template="plotly_dark",
        margin=dict(l=40, r=40, t=50, b=40),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )
    
    fig.update_yaxes(title_text="<b>Engagement Volume</b>", secondary_y=False, title_font=dict(color="#FF4B4B"))
    fig.update_yaxes(title_text="<b>Velocity Delta</b>", secondary_y=True, showgrid=False, title_font=dict(color="#1f77b4"))
    
    return fig


def render_source_distribution(sources: List[Dict[str, Any]] = None):
    """
    Renders source credibility and domain distribution sunburst breakdown.
    """
    if not sources:
        sources = [
            {"domain": "twitter.com", "stance": "spreading", "trust_score": 0.35, "frequency": 42},
            {"domain": "telegram.org", "stance": "spreading", "trust_score": 0.20, "frequency": 35},
            {"domain": "reuters.com", "stance": "debunking", "trust_score": 0.95, "frequency": 12},
            {"domain": "who.int", "stance": "debunking", "trust_score": 0.98, "frequency": 8},
            {"domain": "facebook.com", "stance": "spreading", "trust_score": 0.40, "frequency": 28},
        ]

    df = pd.DataFrame(sources)

    fig = px.sunburst(
        df,
        path=['stance', 'domain'],
        values='frequency',
        color='trust_score',
        color_continuous_scale='RdYlGn',
        title="Domain Stance & Trust Score Distribution"
    )
    fig.update_layout(template="plotly_dark", margin=dict(l=20, r=20, t=50, b=20))
    return fig


def render_narrative_graph(claim_id: str, claim_text: str, keywords: List[str], sources: List[Dict[str, Any]]):
    """
    Builds an optimized, highly readable 2D network node visualization of Claim -> Keywords -> Domains.
    """
    G = nx.Graph()

    # Add Root Claim Node
    claim_short = (claim_text[:27] + "...") if len(claim_text) > 30 else claim_text
    G.add_node(claim_id, label="Primary Claim", text=claim_short, color="#FF4B4B", size=30, node_type="Claim")

    # Add Keyword Nodes
    for kw in keywords:
        kw_label = kw if kw else "Keyword"
        G.add_node(kw_label, label="Key Entity", text=kw_label, color="#FFAA00", size=18, node_type="Keyword")
        G.add_edge(claim_id, kw_label)

    # Add Domain Nodes
    for s in sources:
        domain_name = s.get("domain", "Unknown")
        stance = s.get("stance", "spreading")
        color = "#00CC96" if stance == "debunking" else "#EF553B"
        G.add_node(domain_name, label=f"Source ({stance.capitalize()})", text=domain_name, color=color, size=22, node_type="Domain")
        G.add_edge(claim_id, domain_name)

    # Use spring layout with adjusted k-spacing for high readability
    pos = nx.spring_layout(G, k=0.6, seed=42)

    # Edges trace with subtle transparency
    edge_x = []
    edge_y = []
    for edge in G.edges():
        x0, y0 = pos[edge[0]]
        x1, y1 = pos[edge[1]]
        edge_x.extend([x0, x1, None])
        edge_y.extend([y0, y1, None])

    edge_trace = go.Scatter(
        x=edge_x, y=edge_y,
        line=dict(width=1.8, color='rgba(150, 150, 150, 0.4)'),
        hoverinfo='none',
        mode='lines'
    )

    # Nodes trace
    node_x = [pos[node][0] for node in G.nodes()]
    node_y = [pos[node][1] for node in G.nodes()]
    node_color = [G.nodes[node]['color'] for node in G.nodes()]
    node_size = [G.nodes[node]['size'] for node in G.nodes()]
    
    node_text_labels = []
    hover_texts = []
    for node in G.nodes():
        n_data = G.nodes[node]
        node_text_labels.append(str(n_data['text']))
        hover_texts.append(f"<b>{n_data['label']}</b><br>Identifier: {n_data['text']}")

    node_trace = go.Scatter(
        x=node_x, y=node_y,
        mode='markers+text',
        hoverinfo='text',
        text=node_text_labels,
        textposition="top center",
        textfont=dict(size=11, color="#FFFFFF"),
        hovertext=hover_texts,
        marker=dict(
            color=node_color,
            size=node_size,
            line=dict(width=2.5, color='#FFFFFF')
        )
    )

    fig = go.Figure(data=[edge_trace, node_trace],
                    layout=go.Layout(
                        title="<b>Narrative Propagation & Influence Network Map</b>",
                        showlegend=False,
                        hovermode='closest',
                        margin=dict(b=30, l=30, r=30, t=60),
                        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                        template="plotly_dark",
                        annotations=[
                            dict(
                                text="🔴 Red: Primary Claim | 🟠 Orange: Extracted Entities/Keywords | 🟢 Green: Debunking Source | 🔴 Dark Red: Spreading Source",
                                showarrow=False,
                                xref="paper", yref="paper",
                                x=0, y=-0.08,
                                xanchor="left", yanchor="top",
                                font=dict(size=11, color="gray")
                            )
                        ]
                    ))
    return fig