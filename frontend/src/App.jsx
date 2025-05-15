import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginRegister from './components/LoginRegister'
import Home from './components/Home'
import Reservation from './components/Reservation';
import Main from './components/Main';
import StaffLogin from './components/StaffLogin';
import MenuTable from './components/MenuTable';
import AddItem from './components/AddItem';
import EditItem from './components/EditItem';
import MemberDetails from './components/MemberDetails';
import AddMember from "./components/AddMember"
import EditMember from './components/EditMember';
import StaffDetails from './components/StaffDetails'
import AddStaff from './components/AddStaff'
import EditStaff from './components/EditStaff';
import Tables from './components/Tables';
import EditTables from './components/EditTables'
import TableItem from './components/TableItem';
import CartItems from './components/CartItems';
import Navbar2 from './components/Navbar2';
import Sales from './components/Sales';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />}></Route> 
        <Route path='/reservation' element={<Reservation />}></Route> 
        <Route path='/registeration' element={<LoginRegister />}></Route>
        <Route path='/staffRegisteration' element={<StaffLogin />}></Route>
        <Route path='/dashboard' element={<Main />}></Route>
        <Route path='/tableItem' element={<TableItem />}></Route>
        <Route path='/login' element={<LoginRegister />}></Route>
        <Route path='/menu' element={<MenuTable />}></Route>
        <Route path='/addItem' element={<AddItem />}></Route>
        <Route path='/edititem' element={<EditItem />}></Route>
        <Route path='/members' element={<MemberDetails />}></Route>
        <Route path='/addmember' element={<AddMember />}></Route>
        <Route path='/editmember' element={<EditMember/>}></Route>
        <Route path='/staff' element={<StaffDetails />}></Route>
        <Route path='/addstaff' element={<AddStaff />}></Route>
        <Route path='/editstaff' element={<EditStaff />}></Route>
        <Route path='/tables' element={<Tables />}></Route>
        <Route path='/edit-table' element={<EditTables />}></Route>
        <Route path='/cartItems' element={<CartItems />}></Route>
        <Route path='/sales' element={<Sales />}></Route>
      </Routes>
    </BrowserRouter>

  );
}
export default App;