import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, createRoutesFromElements,Route, RouterProvider} from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute.jsx'
import Login from './pages/Login.jsx'
import Registration from './pages/SignUp.jsx'
import CreateArticlePage from './pages/CreateArticle.jsx'
import ArticleListPage from './pages/MyArticles.jsx'
import EditArticlePage from './pages/EditArticle.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'

import './index.css'
import App from './App.jsx'
import { Provider } from "react-redux";
import { store } from "./redux/store.js";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element = {<App/>}>
       <Route index = {true} path='/' element= {<Dashboard/>}/>
       <Route path='/user-login' element= {<Login/>}/>
       <Route path='/user-regiter' element= {<Registration/>}/>
       {/* Private Routes */}
       <Route path='' element = {<PrivateRoute/>}>
       <Route path='/profile' element= {<Profile/>}/>
       <Route path='/create-article' element= {<CreateArticlePage/>}/>
       <Route path='/my-articles' element= {<ArticleListPage/>}/>
       <Route path='/edit-user-article/:articleId' element= {<EditArticlePage/>}/>
       </Route>
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
  </Provider>
)
