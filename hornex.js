let running = false;
let waves = [], remove_waves = [];
let json;
export class HornexScript extends plugin{
    constructor(){
        super({
            name: 'hornex script',
            dsc: 'hornex script',
            event: 'message',
            priority: 6,
            rule: [
                {
                    reg: 'hornex_start$',
                    fnc: 'start'
                }
            ]
        });
    }
    async start(e){
        running = true;
        if(!e.isMaster) return true;
        console.log('hornex script started')
        e.reply('hornex script started')
        while(running){
            if(!running) return true;
            await fetch('https://zcxjames.top/asdjkla.json').then(res => res.json()).then(data => {
                json = data;
                for(let i in data){
                    if(!i.includes('Ultra') && data[i].time && data[i].progress.includes('Wave') && !waves.includes(i)){
                        waves.push(i);
                        console.log('send wave', i)
                        e.reply([segment.at(e.sender.user_id), ' ', i, ' wave started'])
                    }else if(!i.includes('Ultra') && data[i].time && !data[i].progress.includes('Wave') && waves.includes(i)){
                        remove_waves.push(i);
                    }
                }
                for(let i in remove_waves){
                    waves.splice(waves.indexOf(i), 1);
                }
                remove_waves = [];
            });
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
        return true;
    }
}
export class StopScript extends plugin{
    constructor(){
        super({
            name:'stop script',
            dsc:'stop script',
            event: 'message',
            priority: 5,
            rule: [
                {
                    reg: 'hornex_stop$',
                    fnc:'stop'
                }
            ]
        });
    }
    async stop(e){
        running = false;
        if(!e.isMaster) return true;
        console.log('hornex script stopped')
        e.reply('hornex script stopped')
        return true;
    }
}
export class QueryInfo extends plugin{
    constructor(){
        super({
            name:'query',
            dsc:'query',
            event: 'message',
            priority: 7,
            rule: [
                {
                    reg: 'hornex_query$',
                    fnc:'query'
                }
            ]
        });
    }
    async query(e){
        if(!e.isMaster) return true;
        console.log('query info:', json);
        e.reply(JSON.stringify(json), false, { recallMsg: 10 });
        return true;
    }
}