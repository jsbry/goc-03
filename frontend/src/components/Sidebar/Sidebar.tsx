import { Fa0, Fa1 } from "react-icons/fa6";

function Sidebar() {
  return (
    <nav className="sidebar d-flex flex-column flex-shrink-0 bg-light">
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <a href="#" className="nav-link link-dark" onClick={() => {}}>
            <Fa0 className="me-2"></Fa0>
            Test 0
          </a>
        </li>
        <li>
          <a href="#" className="nav-link link-dark" onClick={() => {}}>
            <Fa1 className="me-2"></Fa1>
            Test 1
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;
