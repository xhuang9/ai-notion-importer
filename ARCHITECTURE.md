# AI Notion Importer - System Architecture

This document illustrates the complete system architecture, showing how all components, utilities, and composables connect together in the refactored application.

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            AI Notion Importer Application                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────────────────────────────────────────┐ │
│  │   Frontend UI   │ ←→ │              Backend API                            │ │
│  │   (Nuxt 4)      │    │          (Server Routes)                           │ │
│  └─────────────────┘    └─────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            External Services                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐              ┌─────────────┐                                  │
│  │ OpenAI API  │              │ Notion API  │                                  │
│  │ (GPT-5)     │              │ Database    │                                  │
│  └─────────────┘              └─────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure (Current)

```
app/
├── components/                          # Vue components (organized by feature)
│   ├── plan-review/                     # Plan review sub-components
│   │   ├── PlanReview.vue              # Main plan review component
│   │   ├── PlanReviewEditModal.vue     # Operation editing modal
│   │   ├── PlanReviewHeader.vue        # Header with action buttons
│   │   ├── PlanReviewInfoCards.vue     # Reasoning & warnings display
│   │   ├── PlanReviewOperationRow.vue  # Individual operation row
│   │   └── PlanReviewOperationsTable.vue # Operations table container
│   ├── settings/                       # Settings management components
│   │   ├── Settings.vue                # Main settings component
│   │   ├── SettingsActionButtons.vue   # Settings action buttons
│   │   ├── SettingsConfigStatus.vue    # Configuration status display
│   │   ├── SettingsConnectionTest.vue  # Connection testing interface
│   │   ├── SettingsNotionSection.vue   # Notion configuration section
│   │   ├── SettingsOpenAISection.vue   # OpenAI configuration section
│   │   ├── SettingsSecurityWarning.vue # Security warnings display
│   │   └── SettingsValidationErrors.vue # Validation errors display
│   ├── system-prompts/                 # System prompts management
│   │   ├── SystemPrompts.vue           # Main system prompts component
│   │   ├── SystemPromptsCreateModal.vue # Create prompt modal
│   │   ├── SystemPromptsEmptyState.vue # Empty state display
│   │   ├── SystemPromptsHeader.vue     # Header with actions
│   │   ├── SystemPromptsImportModal.vue # Import/export modal
│   │   ├── SystemPromptsNotionInfo.vue # Notion integration info
│   │   ├── SystemPromptsPromptCard.vue # Individual prompt card
│   │   └── SystemPromptsSchemaModal.vue # Schema generation modal
│   ├── ActionEditor.vue                # Modal for editing operations
│   ├── LLMPromptWindow.vue            # AI update interface
│   ├── MainForm.vue                   # Form with file upload
│   └── SettingsModal.vue              # Configuration modal wrapper
├── composables/                       # State management (Vue composition functions)
│   ├── useConfiguration.ts            # App configuration management
│   ├── useNotionSchema.ts             # Notion schema management
│   ├── usePlanReviewActions.ts        # Plan review actions
│   ├── usePlanReviewOperations.ts     # Plan review operations logic
│   ├── usePlanReviewState.ts          # Plan review state management
│   ├── usePlanSession.ts              # Session management
│   ├── useSettingsForm.ts             # Settings form management
│   ├── useSystemPrompts.ts            # System prompts CRUD
│   └── useSystemPromptsState.ts       # System prompts state management
├── utils/                             # App-specific utilities
│   └── settingsValidation.ts          # Settings validation utilities
├── assets/                            # Static assets processed by build tool
│   └── css/
│       └── main.css                   # Tailwind CSS configuration and styles
└── app.vue                            # Root Vue component

shared/                                # Auto-imported utilities & types (Nuxt 4)
├── types/                             # TypeScript definitions
│   ├── files.ts                       # File processing types
│   ├── forms.ts                       # Form data types
│   ├── llm-response.ts                # LLM response types
│   ├── notion-schema.ts               # Notion schema types
│   ├── notion.ts                      # Notion API types
│   ├── openai.ts                      # OpenAI API types
│   ├── operations.ts                  # Operation plan types
│   ├── settings.ts                    # Settings configuration types
│   └── system-prompts.ts              # System prompt types
└── utils/                             # Utility functions (auto-imported)
    ├── api-helpers.ts                 # API utility functions
    ├── config-helpers.ts              # Configuration utilities
    ├── field-helpers.ts               # Form field utilities
    ├── file-processor.ts              # File processing class
    ├── llm-analysis.ts                # LLM analysis prompts
    ├── llm-operation-update.ts        # Operation update prompts
    ├── llm-plan-generation.ts         # Plan generation prompts
    ├── llm-prompt-builders.ts         # Common prompt builders
    ├── openai-params.ts               # OpenAI parameter handling
    ├── plan-review-helpers.ts         # Plan review utility functions
    ├── schema-api-query.ts            # API query generation
    ├── schema-data-patterns.ts        # Data pattern analysis
    ├── schema-database-structure.ts   # DB structure prompts
    ├── schema-field-guidance.ts       # Field guidance prompts
    ├── schema-prompt-generator.ts     # Main schema generator
    ├── schema-validation-rules.ts     # Validation prompts
    ├── server-ai-service.ts           # Server-side AI utilities
    └── server-config-helper.ts        # Server configuration

server/                                # Backend API routes (Nuxt server)
├── api/
│   ├── execute-plan.post.ts           # Plan execution endpoint
│   ├── execute-plan-old.post.ts       # Legacy plan execution (backup)
│   ├── generate-plan.post.ts          # Plan generation endpoint
│   ├── notion-schema.get.ts           # Schema retrieval endpoint
│   ├── update-operations.post.ts      # Operation update endpoint
│   └── settings/                      # Settings-related endpoints
│       ├── env-defaults.get.ts        # Environment defaults
│       └── test-connection.post.ts    # Connection testing

public/                                # Publicly accessible static files
├── favicon.ico                        # Site favicon
└── robots.txt                         # Search engine robots configuration
```

## 🔄 Data Flow Architecture

### 1. Plan Generation Flow

```
┌─────────────┐    ┌─────────────────┐    ┌──────────────────┐
│ User Input  │ →  │ MainForm.vue    │ →  │ /api/generate-   │
│ + Files     │    │                 │    │ plan.post.ts     │
└─────────────┘    └─────────────────┘    └──────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                LLM Processing Pipeline                      │
├─────────────────────────────────────────────────────────────┤
│ 1. buildPlanGenerationPrompt()     (llm-plan-generation)   │
│ 2. buildUserPromptWithFiles()      (llm-plan-generation)   │
│ 3. FileProcessor.processFiles()    (file-processor)        │
│ 4. OpenAI API Call                 (server-ai-service)     │
│ 5. Response parsing & validation                           │
└─────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────┐    ┌─────────────────────────────────────┐
│ PlanReview.vue  │ ←  │ Generated OperationPlan[]           │
│ + Sub-components│    │ + Reasoning + Warnings              │
└─────────────────┘    └─────────────────────────────────────┘
```

### 2. Component State Management

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           State Management Architecture                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Core Composables                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │  │ useSystemPrompts│  │ useNotionSchema │  │ usePlanSession  │        │   │
│  │  │                 │  │                 │  │                 │        │   │
│  │  │ • CRUD ops      │  │ • Schema fetch  │  │ • Session mgmt  │        │   │
│  │  │ • LocalStorage  │  │ • Prompt gen    │  │ • SessionStorage│        │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
│                                       ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       UI State Composables                              │   │
│  │  ┌─────────────────────────┐  ┌─────────────────────────────────────┐   │   │
│  │  │ usePlanReviewState      │  │ useSystemPromptsState               │   │   │
│  │  │ usePlanReviewActions    │  │ useSettingsForm                     │   │   │
│  │  │ usePlanReviewOperations │  │                                     │   │   │
│  │  │                         │  │                                     │   │   │
│  │  │ • Operations state      │  │ • Modal states                      │   │   │
│  │  │ • Modal management      │  │ • Form management                   │   │   │
│  │  │ • Edit operations       │  │ • Import/Export                     │   │   │
│  │  │ • Reduces prop drilling │  │ • Schema generation                 │   │   │
│  │  └─────────────────────────┘  └─────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
│                                       ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         UI Components                                   │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │  │ PlanReview.vue  │  │ SystemPrompts   │  │ MainForm.vue    │        │   │
│  │  │ (reduced size)  │  │ (state via      │  │ (minimal state) │        │   │
│  │  │                 │  │ composable)     │  │                 │        │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │   │
│  │           │                                                             │   │
│  │           ▼                                                             │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │              Sub-Components                                     │   │   │
│  │  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │   │   │
│  │  │  │PlanReviewHeader │ │PlanReviewInfo   │ │PlanReviewOper-  │   │   │   │
│  │  │  │                 │ │Cards            │ │ationRow         │   │   │   │
│  │  │  │• Action buttons │ │• Reasoning      │ │• Individual row │   │   │   │
│  │  │  │• Statistics     │ │• Warnings       │ │• Row actions    │   │   │   │
│  │  │  └─────────────────┘ └─────────────────┘ └─────────────────┘   │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🧩 Utility Modules Breakdown

### LLM Prompt Management (Functional Architecture)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           LLM Prompt System (Refactored)                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Core Prompt Functions                            │   │
│  │  ┌─────────────────────┐  ┌─────────────────────────────────────────┐   │   │
│  │  │ llm-plan-generation │  │ llm-operation-update                    │   │   │
│  │  │                     │  │                                         │   │   │
│  │  │ • Plan gen prompts  │  │ • Operation update prompts              │   │   │
│  │  │ • File processing   │  │ • Context building                      │   │   │
│  │  │ • Image analysis    │  │ • Modification logic                    │   │   │
│  │  └─────────────────────┘  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
│                                       ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                     Shared Utilities                                    │   │
│  │  ┌─────────────────────────┐  ┌─────────────────────────────────────┐   │   │
│  │  │ llm-prompt-builders     │  │ llm-analysis                        │   │   │
│  │  │                         │  │                                     │   │   │
│  │  │ • Common builders       │  │ • Analysis prompts                  │   │   │
│  │  │ • Database structure    │  │ • Validation prompts                │   │   │
│  │  │ • Shared constants      │  │ • Connection testing                │   │   │
│  │  └─────────────────────────┘  └─────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Schema Processing Pipeline (Functional Architecture)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      Schema Processing System (Refactored)                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      Main Coordinator                                   │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ schema-prompt-generator                                         │   │   │
│  │  │                                                                 │   │   │
│  │  │ • generateSystemPromptsFromSchema()                             │   │   │
│  │  │ • convertToSystemPrompts()                                      │   │   │
│  │  │ • Coordinates all other schema modules                          │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
│                                       ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                     Specialized Generators                              │   │
│  │                                                                         │   │
│  │  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐ │   │
│  │  │schema-database-     │  │schema-field-        │  │schema-validation│ │   │
│  │  │structure            │  │guidance             │  │rules            │ │   │
│  │  │                     │  │                     │  │                 │ │   │
│  │  │• DB structure       │  │• Field mappings     │  │• Validation     │ │   │
│  │  │• Field definitions  │  │• Select options     │  │• Confidence     │ │   │
│  │  │• API guidelines     │  │• Common mappings    │  │• Error rules    │ │   │
│  │  └─────────────────────┘  └─────────────────────┘  └─────────────────┘ │   │
│  │                                                                         │   │
│  │  ┌─────────────────────┐  ┌─────────────────────────────────────────┐   │   │
│  │  │schema-data-patterns │  │schema-api-query                         │   │   │
│  │  │                     │  │                                         │   │   │
│  │  │• Sample data        │  │• Example operations                     │   │   │
│  │  │• Usage patterns     │  │• API structure                          │   │   │
│  │  │• Recommendations    │  │• Response format                        │   │   │
│  │  └─────────────────────┘  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔌 API Integration Points

### Server API Routes

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Server API Routes                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ /api/generate-plan.post.ts                                              │   │
│  │                                                                         │   │
│  │ Input:  { prompt, files, systemPrompts }                               │   │
│  │ Process: • buildPlanGenerationPrompt()                                  │   │
│  │         • buildUserPromptWithFiles()                                   │   │
│  │         • OpenAI API call                                              │   │
│  │ Output: { plan: OperationPlan[], reasoning, warnings }                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ /api/execute-plan.post.ts                                               │   │
│  │                                                                         │   │
│  │ Input:  { operations: OperationPlan[] }                                │   │
│  │ Process: • Notion API operations                                        │   │
│  │         • Field mapping & validation                                    │   │
│  │         • Error handling                                                │   │
│  │ Output: { success, results, summary }                                   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ /api/update-operations.post.ts                                          │   │
│  │                                                                         │   │
│  │ Input:  { operations, updateInstructions }                             │   │
│  │ Process: • LLM-powered operation updates                                │   │
│  │         • Context-aware modifications                                   │   │
│  │         • Validation & error handling                                   │   │
│  │ Output: { updatedOperations, reasoning }                                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ /api/notion-schema.get.ts                                               │   │
│  │                                                                         │   │
│  │ Input:  None (uses env config)                                          │   │
│  │ Process: • Fetch Notion DB properties                                   │   │
│  │         • Extract field definitions                                     │   │
│  │         • Sample data analysis                                          │   │
│  │ Output: { schema: NotionDatabaseSchema, retrievedAt }                   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ /api/settings/* (Settings Endpoints)                                    │   │
│  │                                                                         │   │
│  │ • env-defaults.get.ts    → Environment default values                  │   │
│  │ • test-connection.post.ts → OpenAI/Notion connection testing           │   │
│  │                                                                         │   │
│  │ Purpose: Settings management and validation                             │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🏷️ Type System Architecture

### Shared Types Organization

```
shared/types/
├── files.ts               # FileMetadata, ProcessedFile, SupportedFileTypes
├── forms.ts               # FormData, SettingsData, ValidationTypes
├── llm-response.ts        # LLM response and analysis types
├── notion-schema.ts       # NotionDatabaseSchema, NotionFieldSchema
├── notion.ts              # NotionTask, NotionSelectOption, NotionProperty
├── openai.ts              # OpenAIMessage, OpenAIResponse, ModelConfig
├── operations.ts          # OperationPlan, OperationResult, ExecutionSummary
├── settings.ts            # Settings configuration and validation types
└── system-prompts.ts      # SystemPrompt, GeneratedSystemPrompt
```

### Type Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Type Flow System                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │ User Input      │ →  │ Processing      │ →  │ Notion Output   │            │
│  │                 │    │                 │    │                 │            │
│  │ • FormData      │    │ • OperationPlan │    │ • NotionTask    │            │
│  │ • ProcessedFile │    │ • SystemPrompt  │    │ • ExecutionResult│           │
│  │ • UserPrompt    │    │ • OpenAIMessage │    │ • OperationResult│           │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🎯 Key Architectural Benefits

### 1. **Functional Architecture**
- **Old**: Class-based SystemPromptGenerator with static methods
- **New**: Pure functions in separate modules by business logic
- **Benefits**: Better testability, tree-shaking, clearer dependencies

### 2. **Component Decomposition**
- **Old**: Large monolithic components (470+ lines)
- **New**: Focused sub-components with clear responsibilities
- **Benefits**: Easier maintenance, better reusability, simpler testing

### 3. **State Management**
- **Old**: Props drilling through multiple component levels
- **New**: Composables manage shared state, minimal props/emits
- **Benefits**: Cleaner component interfaces, centralized logic

### 4. **Utility Organization**
- **Old**: Large mixed-purpose utility files
- **New**: Business-logic grouped modules with clear naming
- **Benefits**: Better discoverability, focused functionality, easier imports

### 5. **Auto-Import System**
- **Nuxt 4**: All shared types and utilities are globally available
- **Benefits**: No manual imports, cleaner code, better DX

## 🔄 Development Workflow

### Adding New Features

1. **Define Types** → `shared/types/feature-name.ts`
2. **Create Utilities** → `shared/utils/feature-*.ts` 
3. **Build Composable** → `app/composables/useFeature.ts`
4. **Create Components** → `app/components/feature/Component.vue`
5. **Add API Routes** → `server/api/feature.post.ts`

### File Naming Conventions

- **Types**: `kebab-case.ts` (e.g., `system-prompts.ts`)
- **Utils**: `business-logic-purpose.ts` (e.g., `llm-plan-generation.ts`)
- **Composables**: `useFeatureName.ts` (e.g., `usePlanReviewState.ts`)
- **Components**: `PascalCase.vue` for main, `kebab-case/PascalCase.vue` for sub-components

This architecture provides a scalable, maintainable foundation for the AI Notion Importer application with clear separation of concerns and excellent developer experience.