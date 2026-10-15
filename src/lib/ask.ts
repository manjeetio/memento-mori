// In-page confirmation dialog (window.confirm can be blocked in embedded/sandboxed views)
export function ask(msg:string):Promise<boolean>{return new Promise(res=>{
 const d=document.createElement('dialog');d.className='dlg'
 const p=document.createElement('p');p.textContent=msg
 const row=document.createElement('div');row.className='row'
 const mk=(t:string,c:string,v:boolean)=>{const b=document.createElement('button');b.textContent=t;b.className='btn '+c;b.onclick=()=>{d.close();d.remove();res(v)};return b}
 const no=mk('Cancel','ghost',false);row.append(no,mk('Confirm','',true));d.append(p,row)
 d.addEventListener('cancel',()=>{d.remove();res(false)});document.body.append(d);d.showModal();no.focus()})}
