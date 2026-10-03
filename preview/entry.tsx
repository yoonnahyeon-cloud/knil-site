// Single-file preview build (no Next runtime): renders the same page with React.
import { createRoot } from "react-dom/client";
import Home from "@/app/page";

createRoot(document.getElementById("root")!).render(<Home />);
