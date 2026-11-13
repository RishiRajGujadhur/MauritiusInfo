export function downloadFile(name,text,type='application/json;charset=utf-8'){
 const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function copyText(text){try{await navigator.clipboard.writeText(text);return true;}catch{return false;}}
export async function readBackup(file){if(!file)throw Error('Choose a backup file.');if(file.size>1000000)throw Error('File is too large (1 MB maximum).');return file.text();}
