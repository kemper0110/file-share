export const signaling = new WebSocket('ws://localhost:4444')
signaling.addEventListener('open', () => {
    signaling.send(JSON.stringify({
        type: 'subscribe',
        topics: ['broadcast']
    }))
})
