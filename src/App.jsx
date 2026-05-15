import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Customer from "./pages/Customer";
import Admin from "./pages/Admin";
import QRGenerator from "./pages/QRGenerator";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/table/:tableId"
          element={<Customer />}
        />

        <Route
          path="/admin"
          element={<Admin />}
        />

        <Route
          path="/qr"
          element={<QRGenerator />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;