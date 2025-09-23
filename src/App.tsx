import EditorInstance from "./features/editor";
import Toolbar from "./features/toolbar";

function App() {
  return (
    <section className="flex flex-col">
      <Toolbar />
      <main>
        <EditorInstance />
      </main>
    </section>
  );
}

export default App;
