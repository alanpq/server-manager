import {useParams} from "react-router-dom";
import React from "react";

import './ServerView.scss';

export function ServerView() {
  const {id} = useParams<any>();
  return <main>
    hi :)
    {id}
  </main>
}