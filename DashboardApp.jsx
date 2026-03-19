import React, { useState, useEffect } from "react";

const Header = () => {
  return (
    <header className="p-4 bg-gray-800 text-white flex justify-between">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <nav className="space-x-4">
        <a href="#home">Home</a>
        <a href="#profile">Profile</a>
        <a href="#settings">Settings</a>
      </nav>
    </header>
  );
};

const Sidebar = ({ items, onSelect }) => {
  return (
    <aside className="w-64 bg-gray-100 h-full p-4">
      <ul>
        {items.map((item, index) => (
          <li
            key={index}
            className="p-2 cursor-pointer hover:bg-gray-200"
            onClick={() => onSelect(item)}
          >
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
};

const Card = ({ title, value }) => {
  return (
    <div className="bg-white shadow rounded p-4">
      <h3 className="text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

const Table = ({ data }) => {
  return (
    <table className="min-w-full bg-white mt-4">
      <thead>
        <tr>
          <th className="py-2">Name</th>
          <th className="py-2">Age</th>
          <th className="py-2">Role</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className="text-center border-t">
            <td className="py-2">{row.name}</td>
            <td className="py-2">{row.age}</td>
            <td className="py-2">{row.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const Form = ({ onSubmit }) => {
  const [formData, setFormData] = useState({ name: "", age: "", role: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: "", age: "", role: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 shadow mt-4">
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
        className="border p-2 mr-2"
      />
      <input
        type="number"
        name="age"
        value={formData.age}
        onChange={handleChange}
        placeholder="Age"
        className="border p-2 mr-2"
      />
      <input
        type="text"
        name="role"
        value={formData.role}
        onChange={handleChange}
        placeholder="Role"
        className="border p-2 mr-2"
      />
      <button className="bg-blue-500 text-white px-4 py-2">Add</button>
    </form>
  );
};

const DashboardContent = () => {
  const [data, setData] = useState([
    { name: "Alice", age: 25, role: "Developer" },
    { name: "Bob", age: 30, role: "Designer" },
  ]);

  const addRow = (row) => {
    setData([...data, row]);
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-4">
        <Card title="Users" value={data.length} />
        <Card title="Active" value={"Yes"} />
        <Card title="Status" value={"Running"} />
      </div>
      <Form onSubmit={addRow} />
      <Table data={data} />
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center p-4 mt-4">
      <p>© 2026 Dashboard Inc.</p>
    </footer>
  );
};

const App = () => {
  const [selected, setSelected] = useState("Dashboard");

  const menuItems = [
    "Dashboard",
    "Analytics",
    "Reports",
    "Settings",
    "Help",
  ];

  useEffect(() => {
    console.log("Selected:", selected);
  }, [selected]);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar items={menuItems} onSelect={setSelected} />
        <main className="flex-1 bg-gray-50">
          {selected === "Dashboard" && <DashboardContent />}
          {selected === "Analytics" && <div className="p-4">Analytics Content</div>}
          {selected === "Reports" && <div className="p-4">Reports Content</div>}
          {selected === "Settings" && <div className="p-4">Settings Content</div>}
          {selected === "Help" && <div className="p-4">Help Content</div>}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default App;

// Additional dummy components to increase size

export const WidgetA = () => {
  return <div className="p-2">Widget A</div>;
};

export const WidgetB = () => {
  return <div className="p-2">Widget B</div>;
};

export const WidgetC = () => {
  return <div className="p-2">Widget C</div>;
};

export const WidgetD = () => {
  return <div className="p-2">Widget D</div>;
};

export const WidgetE = () => {
  return <div className="p-2">Widget E</div>;
};

export const WidgetF = () => {
  return <div className="p-2">Widget F</div>;
};

export const WidgetG = () => {
  return <div className="p-2">Widget G</div>;
};

export const WidgetH = () => {
  return <div className="p-2">Widget H</div>;
};

export const WidgetI = () => {
  return <div className="p-2">Widget I</div>;
};

export const WidgetJ = () => {
  return <div className="p-2">Widget J</div>;
};

export const WidgetK = () => {
  return <div className="p-2">Widget K</div>;
};

export const WidgetL = () => {
  return <div className="p-2">Widget L</div>;
};

export const WidgetM = () => {
  return <div className="p-2">Widget M</div>;
};

export const WidgetN = () => {
  return <div className="p-2">Widget N</div>;
};

export const WidgetO = () => {
  return <div className="p-2">Widget O</div>;
};

export const WidgetP = () => {
  return <div className="p-2">Widget P</div>;
};

export const WidgetQ = () => {
  return <div className="p-2">Widget Q</div>;
};

export const WidgetR = () => {
  return <div className="p-2">Widget R</div>;
};

export const WidgetS = () => {
  return <div className="p-2">Widget S</div>;
};

export const WidgetT = () => {
  return <div className="p-2">Widget T</div>;
};

export const WidgetU = () => {
  return <div className="p-2">Widget U</div>;
};

export const WidgetV = () => {
  return <div className="p-2">Widget V</div>;
};

export const WidgetW = () => {
  return <div className="p-2">Widget W</div>;
};

export const WidgetX = () => {
  return <div className="p-2">Widget X</div>;
};

export const WidgetY = () => {
  return <div className="p-2">Widget Y</div>;
};

export const WidgetZ = () => {
  return <div className="p-2">Widget Z</div>;
};
