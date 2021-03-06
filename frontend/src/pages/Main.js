import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';
import dislike from '../assets/dislike.svg';
import like from '../assets/like.svg';
import itsamatch from '../assets/itsamatch.png';
import io from 'socket.io-client';
import './Main.css';
import api from '../services/Api';

const Main = ({ match }) => {

    const [users, setUsers] = useState([]);
    const [matchDev, setMatchDev] = useState(false);

    useEffect(() => {
        async function loadUsers(id) {
            const response = await api.get('/devs', {
                headers: {
                    user: match.params.id,
                }
            });
            setUsers(response.data);
        }

        loadUsers(match.params.id);

    }, [match.params.id]);

    useEffect(() => {
        const socket = io('http://localhost:3333', {
            query: { user: match.params.id }
        });
        socket.on('match', dev => {
            setMatchDev(dev);
        })


    }, [match.params.id])

    async function handleLike(idDevReceiving) {
        await api.post(`/devs/${idDevReceiving}/likes`, null, {
            headers: { user: match.params.id },
        });

        // Filtra os usuários para remover o usuário que recebeu o like
        setUsers(users.filter(user => user._id !== idDevReceiving));
    }
    async function handleDislike(idDevReceiving) {
        await api.post(`/devs/${idDevReceiving}/dislikes`, null, {
            headers: { user: match.params.id },
        });

        // Filtra os usuários para remover o usuário que recebeu o dislike
        setUsers(users.filter(user => user._id !== idDevReceiving));
    }

    return (
        <div className="main-container">
            <Link to="/"><img src={logo} alt="Tindev" /></Link>
            {users.length > 0 ? (
                <ul>
                    {users.map(user => (
                        <li key={user._id}>
                            <img src={user.avatar} alt={user.name} />
                            <footer>
                                <strong>
                                    {user.name}
                                    <p>{user.bio && "Não possui bio :("}</p>
                                </strong>
                            </footer>
                            <div className="buttons">
                                <button type="button" onClick={() => handleDislike(user._id)}>
                                    <img src={dislike} alt="Dislike" />
                                </button>
                                <button type="button">
                                    <img src={like} alt="Like" onClick={() => handleLike(user._id)} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                    <div className="empty">Acabou...</div>
                )}
            {matchDev && (
                <div className="match-container">
                    <img src={itsamatch} alt="It's a match" />
                    <img className="avatar" src={matchDev.avatar} alt="It's a match" />
                    <strong>{matchDev.name}</strong>
                    <p>{matchDev.bio}</p>

                    <button type="button" onClick={() => setMatchDev(null)}>FECHAR</button>
                </div>
            )}
        </div>
    )
}

export default Main;