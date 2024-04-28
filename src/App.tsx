import {WebrtcProvider} from "y-webrtc";
import {getYjsDoc, syncedStore} from "@syncedstore/core";
import {useEffect, useState} from "react";
import {useSyncedStore} from "@syncedstore/react";

const signaling = 'ws://localhost:4444'
const name = ['Danil', 'Andrey', 'Dmitry', 'Alex', 'Maxim', 'Nikita', 'Sergey', 'Denis', 'Oleg', 'Ivan', 'Evgeny', 'Vladimir',][Math.floor(Math.random() * 100) % 12]
const color = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ff00ff', '#00ffff', '#ffff00', '#0000ff', '#ff0000', '#000000'][Math.floor(Math.random() * 100) % 12]

type UserFile = {
    name: string
    author: User
    content: string | undefined
}

type State = {
    files: UserFile[]
}

const store = syncedStore({
    files: []
} as State);


const ydoc = getYjsDoc(store);


const provider = new WebrtcProvider('file-exchange-room', ydoc, {
    signaling: [signaling]
})
const awareness = provider.awareness;

type AwarenessState = {
    user: User
}

type User = {
    name: string
    color: string
}
awareness.setLocalStateField('user', {
    name,
    color
} as User)

provider.on('status', (status) => {
    console.log('status', status)
})
provider.on('synced', (synced) => {
    console.log('synced', synced)
})

provider.on('peers', (peers) => {
    console.log('peers', peers)
})

function App() {
    const [users, setUsers] = useState([] as AwarenessState[])
    useEffect(() => {
        const callback = () => setUsers([...awareness.getStates().values()])
        awareness.on('change', callback)
        return () => awareness.off('change', callback)
    }, []);

    const state = useSyncedStore(store)
    const [filename, setFilename] = useState('')
    const [content, setContent] = useState(undefined as string | undefined)
    const pushFile = (e) => {
        e.preventDefault()
        console.log(content)
        state.files.push({
            name: filename,
            author: {name, color},
            content: content
        })
    }

    return (
        <div className={'h-screen flex flex-col items-center justify-center'}>
            <div className={'bg-slate-200 p-8 rounded-xl'}>
                <h1 className="text-3xl font-bold underline">
                    Hello {name}!
                </h1>
                <div className={'mt-4'}>
                    {
                        users ? (
                            <ul>
                                {
                                    Object.values(users).map(({user}: { user: User }) => {
                                        console.log({user})
                                        return (
                                            <li key={user.name}>
                                                <div className={'font-semibold text-lg'}
                                                     style={{color: user.color}}>{user.name}</div>
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        ) : null
                    }
                </div>
                <div className={'mt-4'}>
                    <form className={'flex gap-2'} onSubmit={pushFile}>
                        <input className={'w-full'} value={filename} onChange={e => setFilename(e.target.value)}/>
                        <input type={'file'} onChange={e => {
                            const file = e.target?.files?.[0]
                            if (!file) return
                            const reader = new FileReader()
                            reader.onload = () => setContent(reader.result as string)
                            reader.readAsText(file, 'UTF-8')
                        }}/>
                        <button className={'px-2 py-1 border border-black border-solid'}>
                            Push
                        </button>
                    </form>
                    <ul>
                        {
                            state.files.map(file => (
                                <li key={file.name}>
                                    <span className={'font-semibold text-lg'}
                                          style={{color: file.author?.color}}>
                                        {file.author?.name}:
                                    </span>
                                    <span className={'font-semibold text-lg'}>
                                        {file.name}
                                    </span>
                                    <span className={'font-semibold text-xs'}>
                                        {file.content?.substring(0, 50)}
                                    </span>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default App
