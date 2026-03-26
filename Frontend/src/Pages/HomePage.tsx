import { useNavigate } from "react-router-dom"
import { PrimaryButton } from "../Components/Button/PrimaryButton"

export const HomePage = () => {

    const navigate = useNavigate();

    return (
        <>
            <h1>リバーシアプリケーション</h1>
            <div style={{margin:"0 auto", maxWidth:'350px', display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column"}}>
                <PrimaryButton onClick={() => { navigate('/game/local') }}>ローカル対局</PrimaryButton>
                <PrimaryButton onClick={() => { navigate('/game/cpu') }}>CPU対局</PrimaryButton>
                <PrimaryButton onClick={() => { navigate('/game/internet') }}>インターネット対局</PrimaryButton>
            </div>
        </>
    )
}

