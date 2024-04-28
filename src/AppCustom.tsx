import {useStore} from "./custom/store.ts";
import './custom/webrtc.ts'
import {dataChannel} from "./custom/webrtc.ts";
import {useMouse} from "@mantine/hooks";
import {useEffect, useState} from "react";


export const AppCustom = () => {
    const {position} = useStore(state => state)
    const pos = JSON.parse(position)
    const {ref, x, y} = useMouse()

    useEffect(() => {
        if(dataChannel.readyState === 'open')
            dataChannel.send(JSON.stringify({x, y}))
    }, [x, y]);
    return (
        <div className={'h-screen flex flex-col items-center justify-center'}>
            <div ref={ref} className={'bg-slate-200 p-8 rounded-xl size-[400px] relative'}>
                <div className={'absolute bg-red-400 rounded-xl size-5'}
                     style={{
                         left: pos.x,
                         top: pos.y
                     }}
                />
            </div>
        </div>
    )
}
