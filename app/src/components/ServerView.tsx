import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";

import './ServerView.scss';
import {ServerConsole} from "./ServerConsole";
import {fetchServer, useServerComms} from "../websocket/connection_service";
import {Server} from "../modals/server";

export function ServerView() {
  const {id} = useParams<any>();
  const [server, setServer] = useState<Server>();

  useEffect(() => {
    fetchServer(id, setServer);
    return () => {
    }
  }, [id]);

  // @ts-ignore
  const [lines, sendCmd] = useServerComms(id);

  return <main className="server-view">
    <ServerConsole content={lines} onCommand={sendCmd} />
  </main>
}