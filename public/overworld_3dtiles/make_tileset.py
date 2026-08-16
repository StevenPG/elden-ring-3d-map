#!/usr/bin/env python3
"""Rebuild tileset.json from _manifest.json.

By default writes a NON-georeferenced tileset with no root transform, so tile-local
coordinates == world coordinates. That is what src/cesium/camera.ts assumes:
positionCamera multiplies config.camera.home.target by tileset.modelMatrix, and
modelMatrix does NOT include the root transform from tileset.json.

Only pass lon/lat if you actually want it pinned to the globe, and expect to update
the camera/marker code to match.

  python3 make_tileset.py                 # local space (default)
  python3 make_tileset.py --geo LON LAT [HEIGHT]
"""
import json, math, os, sys
HERE=os.path.dirname(os.path.abspath(__file__))
man=json.load(open(os.path.join(HERE,"_manifest.json")))

def enu(lon_deg,lat_deg,h=0.0):
    a=6378137.0; f=1/298.257223563; e2=f*(2-f)
    lon=math.radians(lon_deg); lat=math.radians(lat_deg)
    sl,cl=math.sin(lat),math.cos(lat); so,co=math.sin(lon),math.cos(lon)
    N=a/math.sqrt(1-e2*sl*sl)
    return [-so,co,0,0,-sl*co,-sl*so,cl,0,cl*co,cl*so,sl,0,
            (N+h)*cl*co,(N+h)*cl*so,(N*(1-e2)+h)*sl,1]

def box(bb):
    x0,x1,y0,y1,z0,z1=bb
    return [(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,(x1-x0)/2,0,0,0,(y1-y0)/2,0,0,0,(z1-z0)/2]

geo = len(sys.argv)>1 and sys.argv[1]=="--geo"
allbb=[min(m["bbox"][0] for m in man),max(m["bbox"][1] for m in man),
       min(m["bbox"][2] for m in man),max(m["bbox"][3] for m in man),
       min(m["bbox"][4] for m in man),max(m["bbox"][5] for m in man)]
root={"boundingVolume":{"box":box(allbb)},"geometricError":6000,"refine":"ADD",
      "children":[{"boundingVolume":{"box":box(m["bbox"])},"geometricError":0,
                   "refine":"ADD","content":{"uri":m["name"]+".glb"}}
                  for m in sorted(man,key=lambda m:-m["tris"])]}
if geo:
    lon=float(sys.argv[2]); lat=float(sys.argv[3])
    hgt=float(sys.argv[4]) if len(sys.argv)>4 else 0.0
    root["transform"]=enu(lon,lat,hgt)
json.dump({"asset":{"version":"1.1","tilesetVersion":"lands-between-1.1",
                    "extras":{"ion":{"georeferenced":geo,"movable":True}}},
           "geometricError":6000,"root":root},
          open(os.path.join(HERE,"tileset.json"),"w"), indent=1)
print("wrote tileset.json (%s)" % ("georeferenced" if geo else "local space"))
