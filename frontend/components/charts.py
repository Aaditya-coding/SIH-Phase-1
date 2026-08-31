import plotly.express as px
import plotly.graph_objects as go
import networkx as nx
import pandas as pd
from typing import Dict, Any, List


def render_velocity_curve(velocity_data: List[Dict[str, Any]] = None):
    """
    Renders velocity curves (Spread Rate & Acceleration over time).
    """
    if not velocity_data:
        # Default mock progression if live data is not yet accumulated
        velocity_data = [
            {"time_step": "0h", "shares_per_hour": 15, "cumulative_reach": 150},
            {"time_step": "2h", "shares_per_hour": 120, "cumulative_reach": 850},
            {"time_step": "4h", "shares_per_hour": 480, "cumulative_reach": 3400},
            {"time_step": "6h", "shares_per_hour": 890, "cumulative_reach": 9200},
            {"time_step": "8h", "shares_per_hour": 620, "cumulative_reach": 14500},
            {"time_step": "12h", "shares_per_hour": 310, "cumulative_reach": 18200},
        ]

    df = pd.DataFrame(velocity_data)

    fig = go.Figure()
    # Velocity (Instantaneous rate)
    fig.add_trace(go.Scatter(
        x=df["time_step"],
        y=df["shares_per_hour"],
        mode='lines+markers',
        name='Velocity (Shares/Hr)',
        line=dict(color='#FF4B4B', width=3),
        marker=dict(size=8)
    ))
    # Cumulative Reach
    fig.add_trace(go.Scatter(
        x=df["time_step"],
        y=df["cumulative_reach"],
        mode='lines',
        name='Cumulative Reach',
        line=dict(color='#0068C9', dash='dot', width=2),
        yaxis='y2'
    ))

    fig.update_layout(
        title="Propagation Velocity & Estimated Reach Curve",
        xaxis_title="Timeline Post-Detection",
        yaxis=dict(title="Velocity (Shares/Hour)", title_font=dict(color="#FF4B4B")),
        yaxis2=dict(
            title="Cumulative Reach",
            title_font=dict(color="#0068C9"),
            overlaying='y',
            side='right'
        ),
        legend=dict(x=0.01, y=0.99),
        template="plotly_dark",
        margin=dict(l=40, r=40, t=50, b=40)
    )
    return fig


def render_source_distribution(sources: List[Dict[str, Any]] = None):
    """
    Renders source credibility and domain distribution pie/bar breakdown.
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
    Builds a 2D network node visualization of Claim -> Keywords -> Domains.
    """
    G = nx.Graph()

    # Add Root Claim Node
    G.add_node(claim_id, label="Claim", text=claim_text[:30] + "...", color="#FF4B4B", size=25)

    # Add Keyword Nodes
    for kw in keywords:
        G.add_node(kw, label="Keyword", text=kw, color="#FFAA00", size=15)
        G.add_edge(claim_id, kw)

    # Add Domain Nodes
    for s in sources:
        domain_name = s.get("domain", "Unknown")
        color = "#00CC96" if s.get("stance") == "debunking" else "#EF553B"
        G.add_node(domain_name, label="Domain", text=domain_name, color=color, size=18)
        G.add_edge(claim_id, domain_name)

    pos = nx.spring_layout(G, seed=42)

    # Edges trace
    edge_x = []
    edge_y = []
    for edge in G.edges():
        x0, y0 = pos[edge[0]]
        x1, y1 = pos[edge[1]]
        edge_x.extend([x0, x1, None])
        edge_y.extend([y0, y1, None])

    edge_trace = go.Scatter(
        x=edge_x, y=edge_y,
        line=dict(width=1.5, color='#888'),
        hoverinfo='none',
        mode='lines'
    )

    # Nodes trace
    node_x = [pos[node][0] for node in G.nodes()]
    node_y = [pos[node][1] for node in G.nodes()]
    node_color = [G.nodes[node]['color'] for node in G.nodes()]
    node_size = [G.nodes[node]['size'] for node in G.nodes()]
    node_text = [f"<b>{G.nodes[node]['label']}</b>: {G.nodes[node]['text']}" for node in G.nodes()]

    node_trace = go.Scatter(
        x=node_x, y=node_y,
        mode='markers+text',
        hoverinfo='text',
        text=[G.nodes[node]['text'] for node in G.nodes()],
        textposition="bottom center",
        hovertext=node_text,
        marker=dict(
            color=node_color,
            size=node_size,
            line=dict(width=2, color='#FFF')
        )
    )

    fig = go.Figure(data=[edge_trace, node_trace],
                    layout=go.Layout(
                        title="Narrative Propagation & Influence Graph",
                        showlegend=False,
                        hovermode='closest',
                        margin=dict(b=20, l=20, r=20, t=50),
                        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                        template="plotly_dark"
                    ))
    return fig