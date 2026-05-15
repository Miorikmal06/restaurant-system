import { QRCodeCanvas } from "qrcode.react";

function QRGenerator() {

  const domain = "https://restaurant-system.anakmdr06.workers.dev";

  const tables = Array.from(
    { length: 20 },
    (_, i) => i + 1
  );

  return (

    <div style={{
      padding: 40,
      fontFamily: "sans-serif",
      background: "#f8fafc",
      minHeight: "100vh",
    }}>

      <h1 style={{
        fontSize: 40,
        fontWeight: "bold",
        marginBottom: 40,
      }}>
        Restaurant QR Tables
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 30,
      }}>

        {tables.map(table => (

          <div
            key={table}
            style={{
              border: "1px solid #ddd",
              borderRadius: 20,
              padding: 20,
              textAlign: "center",
              background: "#fff",
            }}
          >

            <h2 style={{
              marginBottom: 20,
              fontSize: 28,
            }}>
              Table {table}
            </h2>

            <QRCodeCanvas
              value={`${domain}/table/${table}`}
              size={180}
            />

            <p style={{
              marginTop: 20,
              fontSize: 12,
              wordBreak: "break-all",
            }}>
              {domain}/table/{table}
            </p>

          </div>

        ))}

      </div>

    </div>

  );

}

export default QRGenerator;