# Prompt Optimizer - MVP v1 (UI-Only Prototype)

A beautiful, fully functional UI-only prompt designer/optimizer built with React, TypeScript, and Tailwind CSS. This MVP focuses on user experience, smooth interactions, and localStorage persistence **without any API integration**.

## 🎯 Features

### ✨ Complete 3-Step Workflow
1. **Step 1: Input Section**
   - Enter your idea and instructions
   - Large, user-friendly text areas
   - Input validation before proceeding

2. **Step 2: Customization**
   - **5 Prompt Styles** (selectable chips):
     - Creative & Conversational
     - Technical & Precise
     - Step-by-Step Instructions
     - Question-Based Approach
     - Role-Playing Scenario
   - **3 Clarifying Questions**:
     - Target Audience (General, Technical, Beginner)
     - Output Length (Short, Medium, Detailed)
     - Tone Preference (Professional, Casual, Friendly)

3. **Step 3: Optimized Prompt Preview**
   - View your generated optimized prompt
   - One-click copy to clipboard
   - Save to history
   - Character & word count
   - Start over option

### 💾 LocalStorage Persistence
- Save prompts to browser localStorage
- View saved prompts in history sidebar
- Load previous prompts
- Delete unwanted prompts
- Automatic timestamp tracking

### 🎨 Beautiful UI/UX
- Modern gradient design
- Smooth animations and transitions
- Fully responsive (mobile, tablet, desktop)
- Dark mode support
- Toast notifications for user feedback
- Collapsible history sidebar

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── HeaderMVP.tsx          # App header with navigation
│   ├── StepOneMVP.tsx         # Step 1: Input component
│   ├── StepTwoMVP.tsx         # Step 2: Styles & questions
│   ├── StepThreeMVP.tsx       # Step 3: Preview & actions
│   ├── SidebarMVP.tsx         # History sidebar
│   ├── FooterMVP.tsx          # App footer
│   └── ui/                     # Reusable UI components
│       ├── button.tsx
│       ├── textarea.tsx
│       ├── chip.tsx
│       ├── toast.tsx
│       └── ...
├── hooks/
│   └── useLocalStorage.ts     # LocalStorage hook
├── utils/
│   └── mockData.ts            # Mock data & generators
├── AppMVP.tsx                 # Main app component
└── main.tsx                   # Entry point
```

## 🔧 Technical Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React hooks (useState, useEffect)
- **Data Persistence**: Browser localStorage

## 🎮 How to Use

### Creating a Prompt

1. **Enter Your Idea**
   - Describe what you want to create
   - Be specific about your goals

2. **Add Instructions**
   - Tell the AI what to focus on
   - Define important aspects

3. **Click "Generate Suggestions"**
   - Mock delay simulates API processing
   - Automatically moves to Step 2

4. **Select Prompt Styles**
   - Choose one or more styles that fit your needs
   - Multiple selections are supported

5. **Answer Questions**
   - Select target audience
   - Choose output length
   - Pick tone preference

6. **Click "Continue"**
   - Mock processing generates optimized prompt
   - Automatically moves to Step 3

7. **Review & Use**
   - Copy to clipboard
   - Save to history
   - Start over for a new prompt

### Managing History

1. **Open Sidebar**
   - Click "History" in navigation
   - Or click menu icon on mobile

2. **View Saved Prompts**
   - See all saved prompts with previews
   - Timestamps show when saved

3. **Load a Prompt**
   - Click "Load" to restore a saved prompt
   - Automatically navigates to Step 3

4. **Delete Prompts**
   - Click trash icon
   - Confirm deletion

## 🎨 Key Features

### Mock Data Generation
- Intelligent prompt optimization based on selections
- Dynamic content based on user choices
- Realistic processing delays

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on small screens
- Adaptive layouts for all screen sizes

### User Feedback
- Toast notifications for actions
- Loading states during processing
- Clear visual feedback for selections

### Smooth Animations
- Fade-in transitions between steps
- Hover effects on interactive elements
- Smooth sidebar slide animations

## 🔄 User Flow

```
Step 1: Input
   ↓
Enter idea & instructions
   ↓
Click "Generate Suggestions" (with mock delay)
   ↓
Step 2: Customization
   ↓
Select styles & answer questions
   ↓
Click "Continue" (with mock delay)
   ↓
Step 3: Preview
   ↓
Copy / Save / Start Over
```

## 💡 Mock Data

All prompt generation is done **locally** using the `generateMockOptimizedPrompt()` function in `utils/mockData.ts`. The function:

- Takes user input (idea, instructions)
- Considers selected styles
- Incorporates question answers
- Generates a formatted, optimized prompt
- Returns immediately (with optional mock delay)

## 🚧 What's NOT Included (MVP v1)

- ❌ No real API integration
- ❌ No external AI service calls
- ❌ No user authentication
- ❌ No cloud storage
- ❌ No prompt versioning
- ❌ No collaborative features

## 🔮 Coming in v2

- ✅ Real API integration (Gemini, Claude, GPT-4)
- ✅ Cloud storage with Supabase
- ✅ User authentication
- ✅ Advanced prompt templates
- ✅ Prompt versioning & comparison
- ✅ Export to multiple formats

## 📝 Development Notes

### Mock Delay
The `mockDelay()` function simulates API latency:
```typescript
await mockDelay(800); // 800ms delay
```

### LocalStorage Key
All prompts are stored under:
```typescript
const STORAGE_KEY = 'prompt_optimizer_history';
```

### Adding New Prompt Styles
Edit `utils/mockData.ts`:
```typescript
export const PROMPT_STYLES: PromptStyle[] = [
  {
    id: 'your-style',
    name: 'Your Style Name',
    description: 'Description here'
  }
];
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173

# Or use a different port
npm run dev -- --port 3000
```

### LocalStorage Full
```javascript
// Clear all data
localStorage.clear();

// Or just prompt history
localStorage.removeItem('prompt_optimizer_history');
```

### TypeScript Errors
```bash
# Rebuild
npm run build
```

## 📄 License

This project is part of the Prompt Optimizer initiative.

## 👥 Contributing

This is an MVP prototype. Contributions for v2 are welcome!

---

**Built with ❤️ by the Prompt Optimizer Team**

*MVP v1 - API integration coming in v2*
