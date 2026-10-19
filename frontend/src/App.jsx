import AppRoutes from "./routes/AppRoutes";
import SearchKeyboardShortcut from "./components/ui/SearchKeyboardShortcut";
import ReactPromptProvider from "./components/ui/ReactPromptProvider";

function App() {
  return (
    <ReactPromptProvider>
      <SearchKeyboardShortcut />
      <AppRoutes />
    </ReactPromptProvider>
  );
}

export default App;
