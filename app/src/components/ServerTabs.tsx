import {Server} from "../modals/server";
import React, {useEffect} from "react";

import {Link, useHistory} from "react-router-dom";

const TabLink = React.forwardRef<HTMLButtonElement, {}>((props, ref) => (
  // <a ref={ref} {...props}>💅 {props.children}</a>
  <button ref={ref} className={(props as any).className} onClick={() => {(props as any).onClick(); (props as any).navigate()}}>{props.children}</button>
));

export function ServerTabs(props: {
  tabs: string[],
  servers: {[name: string]: Server},
  curTab: number,
  onChange: (new_idx: number) => void,
}) {
  const history = useHistory();
  useEffect(() => {
    if(props.curTab !== -1)
      history.push("/server/" + props.tabs[props.curTab]);
  }, [props.curTab]);
  return <nav>
    <Link to={`/dashboard`} component={TabLink}
      className={props.curTab === -1 ? 'current' : ''}
      onClick={() => {props.onChange(-1);}}
    >Dashboard</Link>
    {
      props.tabs.map((value, index) => {
        return <Link to={`/server/${props.servers[value].id}`} component={TabLink}
                     className={index === props.curTab ? 'current' : ''}
                     onClick={() => {props.onChange(index)}}
                     key={index}>{props.servers[value].name}</Link>
      })
    }
    <span className="flex grow"/>
    <button className="user">Username</button>
  </nav>;
}