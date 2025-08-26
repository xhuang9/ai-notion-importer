# 🤖 AI Notion Importer

Transform natural language prompts and file uploads into structured Notion database operations using AI. This intelligent assistant analyzes your content and automatically creates, updates, or manages tasks in your Notion database.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.0-00DC82?style=flat&logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue 3](https://img.shields.io/badge/Vue.js-3.0-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## ✨ What It Does

AI Notion Importer bridges the gap between natural language and structured data management. Simply describe what you want to accomplish, optionally attach relevant files, and watch as AI generates precise Notion database operations that you can review and execute.

**Perfect for:**
- 📋 Project managers creating tasks from meeting notes
- 🎯 Personal productivity enthusiasts organizing their workflows  
- 📊 Teams migrating data from other systems
- 🔄 Anyone who wants to interact with Notion databases conversationally

## 🚀 Key Features

### 🧠 Intelligent Content Processing
- **Natural Language Understanding**: Describe tasks in plain English
- **Multi-file Support**: Upload images, PDFs, CSVs for context
- **Smart Analysis**: AI extracts actionable items automatically
- **Visual Recognition**: Analyze screenshots, whiteboards, and diagrams

### 📊 Flexible Database Integration  
- **Schema-Aware**: Automatically adapts to your Notion database structure
- **No Hardcoded Fields**: Works with any database layout
- **Field Validation**: Ensures data matches your database constraints
- **Type Conversion**: Handles all Notion field types (text, select, date, etc.)

### ⚡ Interactive Workflow
- **Plan Review**: Edit operations before execution
- **Batch Processing**: Handle multiple operations simultaneously
- **Confidence Scoring**: AI provides confidence levels for each operation
- **Smart Prioritization**: Automatic ranking based on urgency and importance

### 🎛️ Advanced System Management
- **Dynamic System Prompts**: Auto-generate AI instructions from your database
- **Custom Prompt Library**: Create reusable AI behavioral templates
- **Configuration Flexibility**: Environment variables or in-app settings
- **Session Management**: Plans persist during your session

## 📋 Prerequisites

Before getting started, you'll need:

- **Node.js** 18.x or higher
- **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Notion Account** with a database you want to manage
- **Basic familiarity** with Notion database concepts

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/yourusername/ai-notion-importer.git
cd ai-notion-importer
npm install
```

### 2. Set Up Your Notion Integration

#### Create a Notion Integration:
1. Visit [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Give it a name (e.g., "LLM Helper") 
4. Select your workspace
5. Copy the "Internal Integration Token" (starts with `secret_`)

#### Prepare Your Notion Database:
1. Open the Notion database you want to manage
2. Click "..." (three dots) → "Add connections"
3. Select your integration to grant access
4. Copy the database ID from the URL (the long string of characters)

### 3. Configure API Access

#### Option A: Environment Variables (Recommended)
Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Required
OPENAI_API_KEY=sk-proj-your-openai-key-here
NOTION_API_KEY=secret_your-notion-integration-token-here  
NOTION_DATABASE_ID=your-database-id-here

# Optional  
LLM_MODEL=gpt-5-mini
OPENAI_MAX_COMPLETION_TOKENS=6000
```

#### Option B: In-App Configuration
Leave `.env` empty and configure through the Settings modal in the app.

### 4. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 🎯 How to Use

### Step 1: Configure System Prompts (First Time Setup)

1. **Click "System Prompts"** in the navigation
2. **Click "Generate from Notion"** to automatically create prompts based on your database structure
   - This analyzes your database fields, types, and existing data
   - Creates validation rules and usage guidance
   - No manual configuration needed!
3. **Optional**: Add custom prompts for specific behaviors

### Step 2: Test Your Connection

1. **Open Settings** (⚙️ icon)
2. **Click "Test Connection"** to verify your API keys and database access
3. **Resolve any issues** before proceeding

### Step 3: Create Your First Plan

1. **Write a prompt** describing what you want to accomplish:
   ```
   "Create tasks for this week's product launch based on the attached meeting notes"
   ```

2. **Upload relevant files** (optional):
   - **Images**: Screenshots, whiteboards, diagrams
   - **PDFs**: Meeting notes, specifications, reports  
   - **CSVs**: Task lists, project data, spreadsheets

3. **Click "Generate Plan"** to let AI analyze and create operations

### Step 4: Review and Execute

1. **Review each operation** in the interactive table
2. **Edit details** like titles, priorities, due dates, and tags
3. **Approve operations** you want to execute
4. **Click "Execute Plan"** to update your Notion database
5. **Check your Notion database** to see the results!

## 💡 Example Use Cases

### 📸 Visual Task Extraction
```
Prompt: "Extract action items from this whiteboard planning session"
Upload: whiteboard-photo.jpg
Result: Individual tasks created from visual content
```

### 📄 Meeting Notes Processing  
```
Prompt: "Create follow-up tasks from today's standup meeting"
Upload: meeting-notes.pdf
Result: Actionable tasks with proper priorities and assignments
```

### 📊 Data Migration
```
Prompt: "Import these project tasks with appropriate categorization"  
Upload: project-export.csv
Result: Bulk task creation with smart field mapping
```

### 🗣️ Natural Language Planning
```
Prompt: "I need to prepare for next week's conference presentation on API design"
Upload: none
Result: Breakdown of preparation tasks with deadlines
```

## ⚙️ Configuration Options

### Supported LLM Models

- **gpt-5-mini** (Default) - Fast and cost-effective
- **gpt-5** - Most capable for complex tasks
- **gpt-5-nano** - Lightweight for simple operations

*Note: GPT-5 models use different API parameters automatically handled by the app*

### File Processing Limits

- **Maximum file size**: 10MB
- **Supported formats**: JPG, PNG, PDF, CSV
- **Image optimization**: Automatic resizing for optimal token usage
- **Text extraction**: Full content analysis for PDFs and CSVs

### Database Compatibility

Works with **any Notion database structure**:
- Text fields
- Number fields  
- Select/Multi-select fields
- Date fields
- Checkbox fields
- URL fields
- And more...

## 🔧 Advanced Features

### Smart Ranking System
Tasks are automatically ranked based on:
- **Priority level** (urgent > important > normal)
- **Due dates** (sooner dates = higher priority)
- **Tag-based scoring** (configurable weighting)

### System Prompt Auto-Generation
The app analyzes your database and creates intelligent prompts:
- Field type constraints and validation
- Existing data patterns and examples
- Select field option validation
- Database relationship understanding

### Session Management
- **Plans**: Stored in session storage (cleared when tab closes)
- **System Prompts**: Stored in local storage (persistent)
- **Settings**: Configurable storage location

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm run preview
```

### Environment Variables for Production
Ensure these are set in your hosting environment:
```env
OPENAI_API_KEY=your_production_openai_key
NOTION_API_KEY=your_production_notion_key  
NOTION_DATABASE_ID=your_production_database_id
LLM_MODEL=gpt-5-mini
```

### Deployment Platforms
Compatible with:
- **Vercel** (recommended for Nuxt apps)
- **Netlify**
- **Railway**
- **Any Node.js hosting platform**

## 🛡️ Security & Privacy

- **API Keys**: Stored securely in environment variables or encrypted browser storage
- **Data Processing**: All data sent only to OpenAI and Notion APIs
- **No External Storage**: No data stored on third-party servers
- **HTTPS Only**: All API communications use secure connections

## 🐛 Troubleshooting

### Common Setup Issues

**"Connection failed" errors:**
- Verify API keys are correct and active
- Ensure Notion database is shared with your integration
- Check that database ID is copied correctly from the URL

**"Schema validation failed":**
- Click "Generate from Notion" to refresh database understanding
- Ensure select field options match exactly (case-sensitive)

**File upload problems:**
- Check file size is under 10MB
- Verify file format is supported (JPG, PNG, PDF, CSV)
- Try uploading one file at a time

### Getting Help

1. **Check the Settings**: Test your connection to isolate API vs. configuration issues
2. **Review System Prompts**: Ensure they match your database structure  
3. **Check Browser Console**: Look for detailed error messages
4. **File an Issue**: Include error messages and steps to reproduce

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

Built with amazing open-source technologies:
- [Nuxt 4](https://nuxt.com/) - Full-stack Vue framework
- [OpenAI API](https://openai.com/) - GPT models for intelligent processing
- [Notion API](https://developers.notion.com/) - Database integration
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling

---

**Ready to transform how you interact with Notion?** 🚀  
[Get Started](#installation--setup) | [View Examples](#example-use-cases) | [Report Issues](https://github.com/yourusername/ai-notion-importer/issues)