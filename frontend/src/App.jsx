import { Outlet } from "react-router-dom"

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="fade-in">
        <Outlet/>
      </main>
    </div>
  );
};

export default App;