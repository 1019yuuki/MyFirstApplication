import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { LocalBattlePage } from './Pages/LocalBattlePage'
import { HomePage } from './Pages/HomePage'
import { CpuBattlePage } from './Pages/CpuBattlePage'

export const App = () => {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/local" element={<LocalBattlePage />} />
          <Route path="/game/cpu" element={<CpuBattlePage />} />
          {/* 404ページ（どれにも一致しない場合） */}
          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
        {/* <GamePage></GamePage> */}
      </BrowserRouter>
    </>
  )
}

