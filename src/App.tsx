import Home from "@/pages/Home";
import Keyboard from "@/pages/Keyboard";
import Mouse from "@/pages/Mouse";
import Gamepad from "@/pages/Gamepad";
import { useAppStore } from "@/store/useAppStore";

export default function App() {
  const { currentMode } = useAppStore();

  switch (currentMode) {
    case 'keyboard':
      return <Keyboard />;
    case 'mouse':
      return <Mouse />;
    case 'gamepad':
      return <Gamepad />;
    default:
      return <Home />;
  }
}
