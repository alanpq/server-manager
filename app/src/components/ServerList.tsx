import {Server} from "../modals/server";
import {createServer, useServerList} from "../websocket/connection_service";
import React, {useState} from "react";

import './ServerList.scss';

type Sort = {column: number, ascend: boolean};

function Sorter(props: {
  sort: Sort,
  column: number,
  onClick: () => void,
}) {
  return <span onClick={props.onClick}
               className={`sorter ${props.sort.ascend ? 'ascend' : ''} ${props.column === props.sort.column ? '' : 'hide'}`}>
    <img src="sorter.svg" />
  </span>;
}

function Sorters(props: {
  onChangeSort: (sort: Sort) => void,
  sort: Sort,
}) {
  const [prev, setPrev] = useState<number>(0);
  const [ascend, setAscend] = useState<boolean>(false);
  const sorter_click = (i: number) => {
    if(i !== prev) {
      setAscend(false);
      props.onChangeSort({column: i, ascend: false});
    } else {
      setAscend(!ascend);
      props.onChangeSort({column: i, ascend: !ascend});
    }
    setPrev(i);
  }

  return <li className="sorters">
    <Sorter sort={props.sort} column={0} onClick={sorter_click.bind(null, 0)}/>
    <Sorter sort={props.sort} column={1} onClick={sorter_click.bind(null, 1)}/>
    <Sorter sort={props.sort} column={2} onClick={sorter_click.bind(null, 2)}/>
  </li>
}

export function ServerList(props: {
  onOpen?: (server: Server) => void,
  onChange?: (server_id: string) => void,
}) {
  const list = useServerList();
  const [current, setCurrent] = useState(-1);

  // TODO: make the sorters actually sort
  const [sort, setSort] = useState<Sort>({column: 0, ascend: false});

  return <ul className="server-list">
    <Sorters onChangeSort={(sort) => {
      setSort(sort);
    }} sort={sort} />
    {
      list.map((srv, index) => {
        return <li
          key={index}
          className={index === current ? 'current' : ''}
          onClick={() => {
            if (props.onChange)
              props.onChange(srv.id);
            setCurrent(index);
          }}
          onDoubleClick={() => {
            if (props.onOpen)
              props.onOpen(srv)
          }}
        >
          <span title={srv.id}>{srv.name}</span>
          <span>{srv.communicator}</span>
          <span>HI</span>
        </li>
      })
    }
    <li className="new" onClick={() => {createServer()}}>+</li>
  </ul>;
}