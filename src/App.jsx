import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";

function App() {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat"); // detect chat route

  return (
    // <div className="flex flex-col h-screen overflow-hidden">
    //   <Header />
    //   <div className="flex flex-1 min-h-0">
        
    //     <div className="flex-1 min-h-0 overflow-hidden">
    //       <Outlet />
    //     </div>
    //   </div>
    // </div>
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 min-h-0">
        {/* Only chat page disables main scroll */}
        <div
          className={`flex-1 min-h-0 ${
            isChatPage ? "overflow-hidden" : "overflow-y-auto"
          } bg-gray-50`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;
