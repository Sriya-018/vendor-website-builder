import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, ArrowStyle
import os

output_dir = r"d:\Folders\vendor\vendor-website-builder\scratch\report_assets"
os.makedirs(output_dir, exist_ok=True)

# -------------------------------------------------------------
# 1. BLOCK DIAGRAM / SYSTEM ARCHITECTURE
# -------------------------------------------------------------
def create_block_diagram():
    fig, ax = plt.subplots(figsize=(10, 7.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    # Color palette
    c_client = '#E8F0FE'
    c_client_border = '#1A73E8'
    c_server = '#E6F4EA'
    c_server_border = '#137333'
    c_data = '#FEF7E0'
    c_data_border = '#F9AB00'
    c_ai = '#FCE8E6'
    c_ai_border = '#D93025'

    # Title
    ax.text(5, 8.1, "AI-Powered Vendor Website Builder - System Architecture", 
            ha='center', va='center', fontsize=14, fontweight='bold', color='#202124')

    # Layer 1: Client Layer
    box_client = FancyBboxPatch((0.6, 5.8), 8.8, 1.8, boxstyle="round,pad=0.2", 
                                facecolor=c_client, edgecolor=c_client_border, linewidth=2)
    ax.add_patch(box_client)
    ax.text(0.8, 7.3, "PRESENTATION LAYER (Frontend - React 18 + Vite + Tailwind CSS)", 
            fontsize=11, fontweight='bold', color=c_client_border)

    # Submodules in Client
    client_mods = [
        ("Vendor Dashboard\n& Analytics UI", 1.8, 6.3),
        ("AI Website Builder\n& Live Preview Editor", 4.1, 6.3),
        ("Product Catalog\n& Order Tracking Tab", 6.4, 6.3),
        ("Public Storefront\n(Responsive View)", 8.5, 6.3)
    ]
    for text, cx, cy in client_mods:
        sub = FancyBboxPatch((cx-0.9, cy-0.35), 1.8, 0.7, boxstyle="round,pad=0.1", 
                             facecolor='white', edgecolor='#5F6368', linewidth=1.2)
        ax.add_patch(sub)
        ax.text(cx, cy, text, ha='center', va='center', fontsize=8, fontweight='semibold')

    # Layer 2: Application / Server Layer
    box_server = FancyBboxPatch((0.6, 2.8), 8.8, 2.4, boxstyle="round,pad=0.2", 
                                facecolor=c_server, edgecolor=c_server_border, linewidth=2)
    ax.add_patch(box_server)
    ax.text(0.8, 4.9, "APPLICATION LAYER (Backend - Node.js & Express.js REST API)", 
            fontsize=11, fontweight='bold', color=c_server_border)

    server_mods = [
        ("Auth & OTP Service\n(Message Central / Mail)", 2.0, 4.1),
        ("AI Generation & Copilot\nController (Gemini)", 5.0, 4.1),
        ("Web Scraper Engine\n(Axios & Cheerio)", 8.0, 4.1),
        ("Store & Template API\n(Website Management)", 2.0, 3.2),
        ("Product & Catalog API\n(Multer Image Pipeline)", 5.0, 3.2),
        ("Order & Inquiries API\n(Lifecycle & Tracking)", 8.0, 3.2)
    ]
    for text, cx, cy in server_mods:
        sub = FancyBboxPatch((cx-1.2, cy-0.3), 2.4, 0.6, boxstyle="round,pad=0.1", 
                             facecolor='white', edgecolor='#5F6368', linewidth=1.2)
        ax.add_patch(sub)
        ax.text(cx, cy, text, ha='center', va='center', fontsize=8, fontweight='semibold')

    # Layer 3: Data & External Layer
    box_data = FancyBboxPatch((0.6, 0.4), 4.2, 1.8, boxstyle="round,pad=0.2", 
                              facecolor=c_data, edgecolor=c_data_border, linewidth=2)
    ax.add_patch(box_data)
    ax.text(0.8, 1.9, "DATABASE & STORAGE LAYER", fontsize=10, fontweight='bold', color='#B06000')

    data_items = [
        ("MongoDB Database (Mongoose ODM)\nBusinesses | Websites | Products | Orders", 2.7, 1.3),
        ("Multer File System\nUploads Storage (Logos, Product Images)", 2.7, 0.7)
    ]
    for text, cx, cy in data_items:
        sub = FancyBboxPatch((cx-1.8, cy-0.25), 3.6, 0.5, boxstyle="round,pad=0.1", 
                             facecolor='white', edgecolor='#80868B', linewidth=1)
        ax.add_patch(sub)
        ax.text(cx, cy, text, ha='center', va='center', fontsize=7.5, fontweight='semibold')

    box_ai = FancyBboxPatch((5.2, 0.4), 4.2, 1.8, boxstyle="round,pad=0.2", 
                            facecolor=c_ai, edgecolor=c_ai_border, linewidth=2)
    ax.add_patch(box_ai)
    ax.text(5.4, 1.9, "EXTERNAL SERVICES & CLOUD APIs", fontsize=10, fontweight='bold', color=c_ai_border)

    ai_items = [
        ("Google Gemini AI API (LLM Generation)\nContent, Layout, FAQs & Logo Design", 7.3, 1.3),
        ("Remove.bg API & SMS Gateway\nAutomated BG Removal & OTP SMS", 7.3, 0.7)
    ]
    for text, cx, cy in ai_items:
        sub = FancyBboxPatch((cx-1.8, cy-0.25), 3.6, 0.5, boxstyle="round,pad=0.1", 
                             facecolor='white', edgecolor='#80868B', linewidth=1)
        ax.add_patch(sub)
        ax.text(cx, cy, text, ha='center', va='center', fontsize=7.5, fontweight='semibold')

    # Arrows between layers
    ax.annotate('', xy=(5, 5.8), xytext=(5, 5.2),
                arrowprops=dict(arrowstyle='<->', lw=2, color='#1A73E8'))
    ax.text(5.2, 5.5, "HTTP / REST JSON (Axios)", fontsize=8, color='#1A73E8', fontweight='bold')

    ax.annotate('', xy=(2.7, 2.8), xytext=(2.7, 2.2),
                arrowprops=dict(arrowstyle='<->', lw=2, color='#F9AB00'))
    ax.text(1.2, 2.5, "Mongoose Queries / GridFS", fontsize=7.5, color='#B06000', fontweight='bold')

    ax.annotate('', xy=(7.3, 2.8), xytext=(7.3, 2.2),
                arrowprops=dict(arrowstyle='<->', lw=2, color='#D93025'))
    ax.text(7.4, 2.5, "REST API Calls / Webhooks", fontsize=7.5, color='#D93025', fontweight='bold')

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, "block_diagram.png"), dpi=300, bbox_inches='tight')
    plt.close()
    print("Block diagram created.")

# -------------------------------------------------------------
# 2. USE CASE DIAGRAM
# -------------------------------------------------------------
def create_use_case_diagram():
    fig, ax = plt.subplots(figsize=(10, 8), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')

    ax.text(5, 9.7, "UML Use Case Diagram - AI-Powered Vendor Website Builder", 
            ha='center', va='center', fontsize=13, fontweight='bold', color='#202124')

    # System boundary box
    sys_box = FancyBboxPatch((2.2, 0.3), 5.6, 9.0, boxstyle="round,pad=0.1", 
                             facecolor='#F8F9FA', edgecolor='#3C4043', linewidth=1.8, linestyle='--')
    ax.add_patch(sys_box)
    ax.text(5, 9.1, "Vendor Website Builder System", ha='center', va='center', 
            fontsize=11, fontweight='bold', color='#1A73E8')

    # Actors: Vendor (Left), Customer (Right), Admin (Bottom Right)
    def draw_stickman(x, y, label):
        # Head
        ax.add_patch(patches.Circle((x, y+0.45), 0.18, facecolor='#202124', edgecolor='#202124', lw=1.5))
        # Body
        ax.plot([x, x], [y+0.27, y-0.15], color='#202124', lw=2)
        # Arms
        ax.plot([x-0.25, x+0.25], [y+0.12, y+0.12], color='#202124', lw=2)
        # Legs
        ax.plot([x, x-0.2], [y-0.15, y-0.55], color='#202124', lw=2)
        ax.plot([x, x+0.2], [y-0.15, y-0.55], color='#202124', lw=2)
        ax.text(x, y-0.75, label, ha='center', va='center', fontsize=9, fontweight='bold', color='#202124')

    draw_stickman(0.9, 6.0, "Vendor\n(Store Owner)")
    draw_stickman(9.1, 7.0, "Customer\n(Buyer)")
    draw_stickman(9.1, 2.2, "Super Admin")

    use_cases = [
        ("Register & Login via OTP", 5, 8.4, [('vendor', 0.9, 6.0)]),
        ("Generate Website via AI (Prompt/URL)", 5, 7.5, [('vendor', 0.9, 6.0)]),
        ("Customize Theme, Layout & Sections", 5, 6.6, [('vendor', 0.9, 6.0)]),
        ("Manage Products (AI BG Removal)", 5, 5.7, [('vendor', 0.9, 6.0)]),
        ("Manage & Track Customer Orders", 5, 4.8, [('vendor', 0.9, 6.0)]),
        ("Respond to Customer Inquiries", 5, 3.9, [('vendor', 0.9, 6.0)]),
        ("View Live Analytics & Traffic", 5, 3.0, [('vendor', 0.9, 6.0)]),
        ("Browse Storefront & Products", 5, 2.1, [('customer', 9.1, 7.0)]),
        ("Place Online Order / Checkout", 5, 1.2, [('customer', 9.1, 7.0)]),
        ("Send Inquiry Message", 5, 0.6, [('customer', 9.1, 7.0)]),
        ("Monitor Platform & Moderate Stores", 5, 0.4, [('admin', 9.1, 2.2)])  # adjust y position
    ]

    # Let's adjust vertical positions smoothly
    uc_list = [
        ("Login via OTP (SMS/Email)", 5, 8.5, ['vendor']),
        ("AI Store Generation & Web Scraping", 5, 7.7, ['vendor']),
        ("Customize Theme, Sections & Copilot", 5, 6.9, ['vendor']),
        ("Product Catalog & Auto BG Removal", 5, 6.1, ['vendor']),
        ("Manage Orders & Dispatch Tracking", 5, 5.3, ['vendor', 'customer']),
        ("Customer Inquiry & Messaging", 5, 4.5, ['vendor', 'customer']),
        ("View Store Analytics & Revenue", 5, 3.7, ['vendor']),
        ("Browse Live Store & Cart Checkout", 5, 2.8, ['customer']),
        ("Submit Contact / Custom Order Query", 5, 1.9, ['customer']),
        ("Super Admin Governance & Metrics", 5, 0.9, ['admin'])
    ]

    for label, cx, cy, actors in uc_list:
        ellipse = patches.Ellipse((cx, cy), 3.2, 0.55, facecolor='white', edgecolor='#1A73E8', linewidth=1.5)
        ax.add_patch(ellipse)
        ax.text(cx, cy, label, ha='center', va='center', fontsize=7.5, fontweight='semibold', color='#202124')

        if 'vendor' in actors:
            ax.plot([0.9, cx-1.6], [6.0, cy], color='#5F6368', lw=1.2, alpha=0.85)
        if 'customer' in actors:
            ax.plot([9.1, cx+1.6], [7.0, cy], color='#5F6368', lw=1.2, alpha=0.85)
        if 'admin' in actors:
            ax.plot([9.1, cx+1.6], [2.2, cy], color='#5F6368', lw=1.2, alpha=0.85)

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, "use_case_diagram.png"), dpi=300, bbox_inches='tight')
    plt.close()
    print("Use case diagram created.")

# -------------------------------------------------------------
# 3. CLASS DIAGRAM
# -------------------------------------------------------------
def create_class_diagram():
    fig, ax = plt.subplots(figsize=(10.5, 8.5), dpi=300)
    ax.set_xlim(0, 10.5)
    ax.set_ylim(0, 9)
    ax.axis('off')

    ax.text(5.25, 8.7, "UML Class Diagram - Vendor Website Builder Data Model", 
            ha='center', va='center', fontsize=13, fontweight='bold', color='#202124')

    def draw_class(x, y, w, h, title, attributes, methods, header_color='#1A73E8'):
        # Outer box
        rect = FancyBboxPatch((x, y), w, h, boxstyle="square,pad=0.0", 
                              facecolor='white', edgecolor='#3C4043', linewidth=1.5)
        ax.add_patch(rect)
        # Header banner
        header = patches.Rectangle((x, y+h-0.45), w, 0.45, facecolor=header_color, edgecolor='#3C4043', lw=1)
        ax.add_patch(header)
        ax.text(x + w/2, y + h - 0.22, title, ha='center', va='center', fontsize=8.5, fontweight='bold', color='white')

        # Attributes section
        curr_y = y + h - 0.6
        for attr in attributes:
            ax.text(x + 0.1, curr_y, attr, ha='left', va='center', fontsize=6.8, fontfamily='monospace', color='#202124')
            curr_y -= 0.18

        # Methods section
        ax.plot([x, x+w], [curr_y, curr_y], color='#3C4043', lw=1)
        curr_y -= 0.12
        for m in methods:
            ax.text(x + 0.1, curr_y, m, ha='left', va='center', fontsize=6.8, fontfamily='monospace', color='#137333')
            curr_y -= 0.18

    # Class 1: Business (Top Left)
    draw_class(0.4, 4.4, 2.9, 3.8, "Business", [
        "- _id: ObjectId",
        "- vendorPhone: String",
        "- vendorEmail: String",
        "- businessName: String",
        "- category: Enum",
        "- location: Object",
        "- contact: Object",
        "- paymentInfo: Object",
        "- socialMedia: Object",
        "- shopHours: Object"
    ], [
        "+ sendOtp(): Promise",
        "+ verifyOtp(): Promise",
        "+ updateProfile(): Promise",
        "+ getBusinessById(): Object"
    ], header_color='#1A73E8')

    # Class 2: Website (Top Middle-Right)
    draw_class(3.8, 4.4, 3.1, 3.8, "Website", [
        "- _id: ObjectId",
        "- businessId: ObjectId [FK]",
        "- storeName: String",
        "- template: String",
        "- theme: Object",
        "- sections: Object",
        "- slug: String [Unique]",
        "- published: Boolean",
        "- views: Number",
        "- designConfig: Mixed"
    ], [
        "+ generateByAI(): Promise",
        "+ scrapeAndBuild(): Promise",
        "+ updateDesign(): Promise",
        "+ publishWebsite(): Promise",
        "+ incrementViews(): Promise"
    ], header_color='#188038')

    # Class 3: Product (Bottom Left)
    draw_class(0.4, 0.4, 2.9, 3.5, "Product", [
        "- _id: ObjectId",
        "- businessId: ObjectId [FK]",
        "- websiteId: ObjectId [FK]",
        "- name: String",
        "- price: Number",
        "- category: String",
        "- imageUrl: String",
        "- inStock: Boolean",
        "- stockQuantity: Number"
    ], [
        "+ addProduct(): Promise",
        "+ removeBackground(): Image",
        "+ updateInventory(): Promise",
        "+ deleteProduct(): Promise"
    ], header_color='#D93025')

    # Class 4: Order (Bottom Center)
    draw_class(3.8, 0.4, 3.1, 3.5, "Order", [
        "- _id: ObjectId",
        "- businessId: ObjectId [FK]",
        "- websiteId: ObjectId [FK]",
        "- customerPhone: String",
        "- customerName: String",
        "- items: Array<Item>",
        "- totalAmount: Number",
        "- status: Enum",
        "- paymentMethod: Enum"
    ], [
        "+ placeOrder(): Promise",
        "+ updateStatus(): Promise",
        "+ sendSMSAlert(): Promise",
        "+ cancelOrder(): Promise"
    ], header_color='#E37400')

    # Class 5: Inquiry (Top/Bottom Right)
    draw_class(7.3, 4.7, 2.8, 3.2, "Inquiry", [
        "- _id: ObjectId",
        "- websiteId: ObjectId [FK]",
        "- businessId: ObjectId [FK]",
        "- name: String",
        "- email: String",
        "- message: String",
        "- createdAt: Date"
    ], [
        "+ submitInquiry(): Promise",
        "+ getInquiries(): Array",
        "+ deleteInquiry(): Promise"
    ], header_color='#9334E6')

    # Class 6: Image / Asset (Bottom Right)
    draw_class(7.3, 0.4, 2.8, 3.5, "Asset / Image", [
        "- _id: ObjectId",
        "- businessId: ObjectId [FK]",
        "- originalUrl: String",
        "- processedUrl: String",
        "- fileType: String",
        "- fileSize: Number"
    ], [
        "+ uploadImage(): Promise",
        "+ removeBgApi(): Promise",
        "+ deleteAsset(): Promise"
    ], header_color='#5F6368')

    # Relationship connectors
    # Business 1 --- * Website
    ax.annotate('', xy=(3.8, 6.3), xytext=(3.3, 6.3),
                arrowprops=dict(arrowstyle='<->', lw=1.5, color='#3C4043'))
    ax.text(3.35, 6.45, "1", fontsize=8, fontweight='bold')
    ax.text(3.65, 6.45, "1..*", fontsize=8, fontweight='bold')

    # Website 1 --- * Product
    ax.plot([4.3, 4.3, 3.3], [4.4, 3.9, 3.9], color='#3C4043', lw=1.5)
    ax.text(4.35, 4.1, "1", fontsize=8, fontweight='bold')
    ax.text(3.4, 3.95, "*", fontsize=8, fontweight='bold')

    # Website 1 --- * Order
    ax.annotate('', xy=(5.3, 3.9), xytext=(5.3, 4.4),
                arrowprops=dict(arrowstyle='<->', lw=1.5, color='#3C4043'))
    ax.text(5.4, 4.2, "1", fontsize=8, fontweight='bold')
    ax.text(5.4, 4.0, "*", fontsize=8, fontweight='bold')

    # Website 1 --- * Inquiry
    ax.annotate('', xy=(7.3, 6.3), xytext=(6.9, 6.3),
                arrowprops=dict(arrowstyle='<->', lw=1.5, color='#3C4043'))
    ax.text(6.95, 6.45, "1", fontsize=8, fontweight='bold')
    ax.text(7.15, 6.45, "*", fontsize=8, fontweight='bold')

    # Business 1 --- * Product
    ax.annotate('', xy=(1.8, 3.9), xytext=(1.8, 4.4),
                arrowprops=dict(arrowstyle='<->', lw=1.5, color='#3C4043'))
    ax.text(1.9, 4.2, "1", fontsize=8, fontweight='bold')
    ax.text(1.9, 4.0, "*", fontsize=8, fontweight='bold')

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, "class_diagram.png"), dpi=300, bbox_inches='tight')
    plt.close()
    print("Class diagram created.")

# -------------------------------------------------------------
# 4. SEQUENCE DIAGRAM
# -------------------------------------------------------------
def create_sequence_diagram():
    fig, ax = plt.subplots(figsize=(10, 7.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    ax.text(5, 8.1, "Sequence Diagram - AI Website Generation & Publishing Workflow", 
            ha='center', va='center', fontsize=13, fontweight='bold', color='#202124')

    lifelines = [
        ("Vendor\n(Client UI)", 1.2),
        ("React App\n(Frontend)", 3.4),
        ("Express API\n(Server)", 5.6),
        ("Gemini AI\n(LLM Engine)", 7.6),
        ("MongoDB\n(Database)", 9.2)
    ]

    for name, x in lifelines:
        # Box at top
        box = FancyBboxPatch((x-0.8, 7.2), 1.6, 0.55, boxstyle="round,pad=0.1", 
                             facecolor='#E8F0FE', edgecolor='#1A73E8', lw=1.5)
        ax.add_patch(box)
        ax.text(x, 7.47, name, ha='center', va='center', fontsize=8, fontweight='bold')
        # Dashed lifeline
        ax.plot([x, x], [7.2, 0.4], color='#80868B', linestyle='--', lw=1.2)

    messages = [
        (1.2, 3.4, 6.7, "1. Select Category / Input URL", True),
        (3.4, 5.6, 6.2, "2. POST /api/ai/scrape-and-recommend", True),
        (5.6, 7.6, 5.7, "3. Generate Website Spec & Content", True),
        (7.6, 5.6, 5.2, "4. Return Structured JSON Spec", False),
        (5.6, 9.2, 4.7, "5. Save Website Record (Draft)", True),
        (9.2, 5.6, 4.2, "6. Confirm Draft Saved", False),
        (5.6, 3.4, 3.7, "7. Send Config & Render Editor", False),
        (1.2, 3.4, 3.1, "8. Customize Theme & Edit Products", True),
        (3.4, 5.6, 2.5, "9. PUT /api/websites/update/:id", True),
        (5.6, 9.2, 2.0, "10. Update Website Document", True),
        (1.2, 3.4, 1.4, "11. Click Publish Storefront", True),
        (3.4, 5.6, 0.9, "12. POST /api/websites/:id/publish", True),
        (5.6, 3.4, 0.5, "13. Return Live Store URL /slug", False)
    ]

    for x1, x2, y, text, is_call in messages:
        style = '->' if is_call else '--'
        line_color = '#1A73E8' if is_call else '#137333'
        arrow_style = ArrowStyle("->") if is_call else ArrowStyle("->")
        ls = '-' if is_call else '--'
        
        ax.annotate('', xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle='->', lw=1.2, color=line_color, linestyle=ls))
        mid_x = (x1 + x2) / 2
        ax.text(mid_x, y + 0.12, text, ha='center', va='bottom', fontsize=7.2, 
                fontweight='semibold', color='#202124')

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, "sequence_diagram.png"), dpi=300, bbox_inches='tight')
    plt.close()
    print("Sequence diagram created.")

# -------------------------------------------------------------
# 5. STATE CHART DIAGRAM
# -------------------------------------------------------------
def create_state_chart_diagram():
    fig, ax = plt.subplots(figsize=(10, 7.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    ax.text(5, 8.1, "UML State Chart Diagram - Storefront & Order Lifecycle", 
            ha='center', va='center', fontsize=13, fontweight='bold', color='#202124')

    # Initial state node
    init_circle = patches.Circle((1.0, 7.0), 0.15, facecolor='#202124', edgecolor='#202124')
    ax.add_patch(init_circle)
    ax.text(1.0, 7.3, "Start", ha='center', va='center', fontsize=8, fontweight='bold')

    states = [
        ("Store Created\n(Profile Initialized)", 3.0, 7.0),
        ("AI Draft Generated\n(Spec & Copy Ready)", 6.0, 7.0),
        ("Theme Customization\n(Sections & Colors Configured)", 8.5, 5.2),
        ("Catalog Loaded\n(Products & BG Removed)", 6.0, 3.4),
        ("Store Published\n(Live Public URL)", 2.5, 3.4),
        ("Active Operations\n(Orders & Inquiries Handling)", 2.5, 1.5)
    ]

    for label, cx, cy in states:
        box = FancyBboxPatch((cx-1.2, cy-0.45), 2.4, 0.9, boxstyle="round,pad=0.15", 
                             facecolor='#E8F0FE', edgecolor='#1A73E8', lw=1.6)
        ax.add_patch(box)
        ax.text(cx, cy, label, ha='center', va='center', fontsize=8, fontweight='bold', color='#202124')

    # Final state node
    final_circle_out = patches.Circle((7.5, 1.5), 0.22, facecolor='none', edgecolor='#202124', lw=1.5)
    final_circle_in = patches.Circle((7.5, 1.5), 0.13, facecolor='#202124', edgecolor='#202124')
    ax.add_patch(final_circle_out)
    ax.add_patch(final_circle_in)
    ax.text(7.5, 1.9, "Archived / Inactive", ha='center', va='center', fontsize=8, fontweight='bold')

    # Transitions with annotations
    transitions = [
        ((1.15, 7.0), (1.8, 7.0), "Vendor signs up"),
        ((4.2, 7.0), (4.8, 7.0), "Execute AI Generator / Scraper"),
        ((7.2, 7.0), (8.0, 5.7), "Open Live Preview Editor"),
        ((8.0, 4.8), (7.2, 3.8), "Configure Products & Uploads"),
        ((4.8, 3.4), (3.7, 3.4), "Click Publish Store"),
        ((2.5, 2.95), (2.5, 1.95), "Customer Visits & Purchases"),
        ((3.7, 1.5), (7.25, 1.5), "Store Deactivation / Closure")
    ]

    for p1, p2, label in transitions:
        ax.annotate('', xy=p2, xytext=p1,
                    arrowprops=dict(arrowstyle='->', lw=1.5, color='#137333'))

    # Transition labels
    ax.text(1.5, 7.2, "OTP Auth", fontsize=7.2, fontweight='semibold', color='#137333')
    ax.text(4.5, 7.2, "AI Engine", fontsize=7.2, fontweight='semibold', color='#137333')
    ax.text(8.2, 6.5, "Live Editor", fontsize=7.2, fontweight='semibold', color='#137333')
    ax.text(8.2, 4.1, "Catalog Sync", fontsize=7.2, fontweight='semibold', color='#137333')
    ax.text(4.25, 3.6, "Publish Domain", fontsize=7.2, fontweight='semibold', color='#137333')
    ax.text(2.6, 2.5, "Incoming Orders", fontsize=7.2, fontweight='semibold', color='#137333')
    ax.text(5.5, 1.7, "Close / Archive Business", fontsize=7.2, fontweight='semibold', color='#137333')

    # Self loop for active operations
    ax.annotate('', xy=(1.5, 1.2), xytext=(1.5, 1.8),
                arrowprops=dict(arrowstyle='->', lw=1.2, color='#1A73E8',
                                connectionstyle="arc3,rad=-1.2"))
    ax.text(0.1, 1.5, "Continuous\nUpdates & Orders", fontsize=7, color='#1A73E8', fontweight='semibold')

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, "state_chart_diagram.png"), dpi=300, bbox_inches='tight')
    plt.close()
    print("State chart diagram created.")

# -------------------------------------------------------------
# 6. ACTIVITY DIAGRAM
# -------------------------------------------------------------
def create_activity_diagram():
    fig, ax = plt.subplots(figsize=(10, 8.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 9.5)
    ax.axis('off')

    ax.text(5, 9.1, "UML Activity Diagram - Vendor Onboarding & Store Deployment", 
            ha='center', va='center', fontsize=13, fontweight='bold', color='#202124')

    # Start Node
    ax.add_patch(patches.Circle((5, 8.5), 0.18, facecolor='#202124', edgecolor='#202124'))
    ax.text(5, 8.8, "Start", ha='center', va='center', fontsize=8, fontweight='bold')

    # Step 1: Login / OTP
    def draw_activity(cx, cy, text, w=3.4, h=0.65, color='#E8F0FE', border='#1A73E8'):
        box = FancyBboxPatch((cx-w/2, cy-h/2), w, h, boxstyle="round,pad=0.15", 
                             facecolor=color, edgecolor=border, lw=1.5)
        ax.add_patch(box)
        ax.text(cx, cy, text, ha='center', va='center', fontsize=7.8, fontweight='bold', color='#202124')

    def draw_decision(cx, cy, label):
        d = patches.RegularPolygon((cx, cy), numVertices=4, radius=0.45, 
                                   orientation=0, facecolor='#FEF7E0', edgecolor='#F9AB00', lw=1.5)
        ax.add_patch(d)
        ax.text(cx, cy, label, ha='center', va='center', fontsize=6.8, fontweight='bold', color='#202124')

    draw_activity(5, 7.7, "Enter Phone / Email & Verify OTP")
    draw_decision(5, 6.7, "Has Existing\nWebsite?")

    # Branch A: Scrape URL
    draw_activity(2.5, 5.7, "Input URL & Run AI Scraper\n(Axios + Cheerio)", w=3.0)
    # Branch B: Select Category
    draw_activity(7.5, 5.7, "Select Category & Theme\n(35+ Templates)", w=3.0)

    # Merge Node
    draw_activity(5, 4.7, "AI Gemini Generates Layout,\nCopy, FAQs & Color Palette", w=3.6)

    # Live Editor
    draw_activity(5, 3.7, "Customize in Live Preview Editor\n(Hero, Sections, Typography)", w=3.6)

    # Product Management
    draw_activity(5, 2.7, "Upload Products & Run AI Background Removal\n(Remove.bg API)", w=3.8)

    # Publish
    draw_activity(5, 1.7, "Publish Storefront (Generate Unique Slug / URL)", w=3.6)

    # Final Node
    ax.add_patch(patches.Circle((5, 0.7), 0.22, facecolor='none', edgecolor='#202124', lw=1.5))
    ax.add_patch(patches.Circle((5, 0.7), 0.13, facecolor='#202124', edgecolor='#202124'))
    ax.text(5, 0.35, "Store Live & Ready for Orders", ha='center', va='center', fontsize=8, fontweight='bold')

    # Arrows
    ax.annotate('', xy=(5, 8.05), xytext=(5, 8.32), arrowprops=dict(arrowstyle='->', lw=1.5, color='#1A73E8'))
    ax.annotate('', xy=(5, 7.15), xytext=(5, 7.37), arrowprops=dict(arrowstyle='->', lw=1.5, color='#1A73E8'))

    # Branch arrows
    ax.plot([4.55, 2.5, 2.5], [6.7, 6.7, 6.05], color='#1A73E8', lw=1.5)
    ax.annotate('', xy=(2.5, 6.05), xytext=(2.5, 6.15), arrowprops=dict(arrowstyle='->', lw=1.5, color='#1A73E8'))
    ax.text(3.4, 6.85, "Yes [URL]", fontsize=7, fontweight='bold', color='#137333')

    ax.plot([5.45, 7.5, 7.5], [6.7, 6.7, 6.05], color='#1A73E8', lw=1.5)
    ax.annotate('', xy=(7.5, 6.05), xytext=(7.5, 6.15), arrowprops=dict(arrowstyle='->', lw=1.5, color='#1A73E8'))
    ax.text(6.0, 6.85, "No [Fresh]", fontsize=7, fontweight='bold', color='#137333')

    # Merge into AI Engine
    ax.plot([2.5, 2.5, 4.0], [5.35, 4.7, 4.7], color='#1A73E8', lw=1.5)
    ax.plot([7.5, 7.5, 6.0], [5.35, 4.7, 4.7], color='#1A73E8', lw=1.5)
    ax.annotate('', xy=(3.2, 4.7), xytext=(2.5, 4.7), arrowprops=dict(arrowstyle='->', lw=1.5, color='#1A73E8'))

    # Sequential arrows
    ax.annotate('', xy=(5, 4.05), xytext=(5, 4.37), arrowprops=dict(arrowstyle='->', lw=1.5, color='#1A73E8'))
    ax.annotate('', xy=(5, 3.05), xytext=(5, 3.37), arrowprops=dict(arrowstyle='->', lw=1.5, color='#1A73E8'))
    ax.annotate('', xy=(5, 2.05), xytext=(5, 2.37), arrowprops=dict(arrowstyle='->', lw=1.5, color='#1A73E8'))
    ax.annotate('', xy=(5, 0.95), xytext=(5, 1.37), arrowprops=dict(arrowstyle='->', lw=1.5, color='#1A73E8'))

    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, "activity_diagram.png"), dpi=300, bbox_inches='tight')
    plt.close()
    print("Activity diagram created.")

if __name__ == "__main__":
    create_block_diagram()
    create_use_case_diagram()
    create_class_diagram()
    create_sequence_diagram()
    create_state_chart_diagram()
    create_activity_diagram()
    print("All 6 diagrams created successfully.")
