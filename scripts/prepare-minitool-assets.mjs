import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
const repo=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(await fs.readFile(process.argv[2],'utf8'));
const out=path.resolve(process.argv[3]);
const reportPath=process.argv[4];
const cache=path.join(repo,'.minitool-build/images');
await fs.mkdir(cache,{recursive:true});
const images=[];
for (const url of manifest.paths) {
  if (!url.startsWith('/art/')||url.includes('..')) throw Error(`Invalid art path ${url}`);
  const source=path.join(repo,'public',url);
  const bytes=await fs.readFile(source);
  const png=url.endsWith('.png');
  const local='./assets'+url.replace(/\.png$/,'.webp');
  const target=path.join(out,local);
  await fs.mkdir(path.dirname(target),{recursive:true});
  const beforeHash=createHash('sha256').update(bytes).digest('hex');
  if (png) {
    const quality=Number(process.env.MINITOOL_IMAGE_QUALITY||95);
    const cached=path.join(cache,beforeHash+'-q'+quality+'.webp');
    try { await fs.access(cached); } catch { await sharp(bytes).webp({quality,alphaQuality:100,effort:6,smartSubsample:true}).toFile(cached); }
    const before=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    async function compare(file) {
      const after=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
      if(before.info.width!==after.info.width||before.info.height!==after.info.height||before.data.length!==after.data.length)throw Error(`Dimension mismatch ${url}`);
      let visibleMismatch=0,alphaMismatch=0,invisibleRgbDifference=0,squaredError=0,compositedSquaredError=0,visibleValues=0,maxRgbError=0;
      for(let i=0;i<before.data.length;i+=4){
        if(before.data[i+3]!==after.data[i+3])alphaMismatch++;
        for(let c=0;c<3;c++){
          if(before.data[i+3]!==0){const diff=before.data[i+c]-after.data[i+c];squaredError+=diff*diff;compositedSquaredError+=(diff*before.data[i+3]/255)**2;visibleValues++;maxRgbError=Math.max(maxRgbError,Math.abs(diff));}
          if(before.data[i+c]!==after.data[i+c]){if(before.data[i+3]!==0)visibleMismatch++;else invisibleRgbDifference++;}
        }
      }
      
      return {alphaExact:alphaMismatch===0,visibleRgbExact:visibleMismatch===0,invisibleRgbDifference,maxRgbError,visiblePsnrDb:squaredError===0?null:10*Math.log10(255*255/(squaredError/visibleValues)),alphaCompositedPsnrDb:compositedSquaredError===0?null:10*Math.log10(255*255/(compositedSquaredError/visibleValues))};
    }
    let selected=cached,encoding='high-quality WebP (lossy RGB, lossless alpha)',metrics=await compare(cached),selectedQuality=quality;
    // Escalate quality for fine saturated details; no image may fail this
    // conservative composited-error gate merely to fit the archive budget.
    for(const higher of [98,100]){
      if(metrics.alphaExact&&(metrics.alphaCompositedPsnrDb===null||metrics.alphaCompositedPsnrDb>=38))break;
      selected=path.join(cache,beforeHash+'-q'+higher+'.webp');
      try{await fs.access(selected);}catch{await sharp(bytes).webp({quality:higher,alphaQuality:100,effort:6,smartSubsample:true}).toFile(selected);}
      metrics=await compare(selected);selectedQuality=higher;
    }
    if(!metrics.alphaExact||(metrics.alphaCompositedPsnrDb!==null&&metrics.alphaCompositedPsnrDb<38)){
      selected=path.join(cache,beforeHash+'-near60.webp');
      try{await fs.access(selected);}catch{await sharp(bytes).webp({nearLossless:true,quality:60,effort:6}).toFile(selected);}
      metrics=await compare(selected);encoding='near-lossless WebP';selectedQuality=60;
    }
    if(!metrics.alphaExact||(metrics.alphaCompositedPsnrDb!==null&&metrics.alphaCompositedPsnrDb<38)){
      selected=path.join(cache,beforeHash+'.webp');
      try{await fs.access(selected);}catch{await sharp(bytes).webp({lossless:true,effort:6}).toFile(selected);}
      metrics=await compare(selected);encoding='lossless WebP';selectedQuality=null;
      if(!metrics.alphaExact||!metrics.visibleRgbExact)throw Error(`Lossless fallback mismatch ${url}`);
    }
    await fs.copyFile(selected,target);
    images.push({source:url,target:local,encoding,quality:selectedQuality,width:before.info.width,height:before.info.height,sourceBytes:bytes.length,bytes:(await fs.stat(target)).size,...metrics,sha256:createHash('sha256').update(await fs.readFile(target)).digest('hex')});
  } else {
    await fs.writeFile(target,bytes);
    const meta=url.endsWith('.svg')?{}:await sharp(bytes).metadata();
    let masterCheck={};
    if(url.endsWith('.webp')){
      // Pre-encoded art must pass the same clarity gate as PNGs encoded here.
      const masterFile=source.replace(/\.webp$/,'.png');
      let master;
      try{master=await fs.readFile(masterFile);}catch(error){
        if(error.code!=='ENOENT')throw error;
        if(url.startsWith('/art/sister-v6/'))throw Error(`Missing PNG master for clarity audit ${url}`);
      }
      if(master){
        const before=await sharp(master).ensureAlpha().raw().toBuffer({resolveWithObject:true});
        const after=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
        if(before.info.width!==after.info.width||before.info.height!==after.info.height||before.data.length!==after.data.length)throw Error(`Pre-encoded dimension mismatch ${url}`);
        let alphaExact=true,squaredError=0,visibleValues=0;
        for(let i=0;i<before.data.length;i+=4){
          if(before.data[i+3]!==after.data[i+3])alphaExact=false;
          if(before.data[i+3]!==0)for(let c=0;c<3;c++){
            squaredError+=((before.data[i+c]-after.data[i+c])*before.data[i+3]/255)**2;visibleValues++;
          }
        }
        const alphaCompositedPsnrDb=squaredError===0?null:10*Math.log10(255*255/(squaredError/visibleValues));
        if(!alphaExact||(alphaCompositedPsnrDb!==null&&alphaCompositedPsnrDb<38))throw Error(`Pre-encoded clarity gate failed ${url}: ${alphaCompositedPsnrDb}`);
        masterCheck={master:url.replace(/\.webp$/,'.png'),masterSha256:createHash('sha256').update(master).digest('hex'),alphaExact,alphaCompositedPsnrDb};
      }
    }
    images.push({source:url,target:local,encoding:'byte-for-byte copy',width:meta.width,height:meta.height,sourceBytes:bytes.length,bytes:bytes.length,sha256:beforeHash,...masterCheck});
  }
}
const report={count:images.length,totalSourceBytes:images.reduce((a,x)=>a+x.sourceBytes,0),totalBytes:images.reduce((a,x)=>a+x.bytes,0),resized:false,lossyReencoded:images.some(x=>x.encoding!=='byte-for-byte copy'),images};
await fs.writeFile(reportPath,JSON.stringify(report,null,2));
console.log(JSON.stringify({images:report.count,imageBytes:report.totalBytes,sourceBytes:report.totalSourceBytes,resized:false,lossyReencoded:report.lossyReencoded}));
