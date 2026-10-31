# Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
# https://github.com/Melbourne-University-Motorsports/mur-voir
#
# Use of this source code is governed by a BSD
# license that can be found in the LICENSE file
# at the root directory of this project.

"""Generate tiny reference fixtures with asammdf (pip install asammdf)."""
from pathlib import Path
import json
import numpy as np
from asammdf import MDF, Signal

out = Path(__file__).resolve().parents[2] / 'test/fixtures/mf4'
out.mkdir(parents=True, exist_ok=True)
t = np.array([0., .5, 1., 1.5])
m = MDF(version='4.10')
m.append([
    Signal(np.array([10.,20.,30.,40.]), t, name='Speed', unit='m/s'),
    Signal(np.array([-12,0,12,24], dtype='>i2'), t, name='Signed', unit='A'),
    Signal(np.array([0,1,1,0], dtype='u1'), t, name='State', conversion={'val_0':0, 'text_0':b'Idle', 'val_1':1, 'text_1':b'Drive'}),
], acq_name='Vehicle')
for compression in [0,1,2]:
    m.save(out/f'decoded-{compression}.mf4', overwrite=True, compression=compression)
expected={name:{'timestamps':m.get(name).timestamps.tolist(),'samples':m.get(name).samples.tolist()} for name in ['Speed','Signed']}
(out/'expected.json').write_text(json.dumps(expected, indent=2)+'\n')
bus=np.zeros(12,dtype=[('CAN_DataFrame.BusChannel','u1'),('CAN_DataFrame.ID','<u4'),('CAN_DataFrame.IDE','u1'),('CAN_DataFrame.DLC','u1'),('CAN_DataFrame.DataLength','u1'),('CAN_DataFrame.DataBytes','u1',(8,))])
bus['CAN_DataFrame.ID'][:4]=0x0a5
bus['CAN_DataFrame.ID'][4:8]=0x122
bus['CAN_DataFrame.ID'][8:]=0x203
bus['CAN_DataFrame.DLC']=8
bus['CAN_DataFrame.DataLength']=8
for i in range(4):bus['CAN_DataFrame.DataBytes'][i,2:4]=np.frombuffer((1000*(i+1)).to_bytes(2,'little'),dtype='u1')
bus['CAN_DataFrame.DataBytes'][4:8,4]=[0,1,2,3]
bus['CAN_DataFrame.DataBytes'][8:]=255
b=MDF(version='4.10')
b.append(Signal(bus,np.arange(12)*.5,name='CAN_DataFrame'),acq_name='CAN')
b.save(out/'bus.mf4',overwrite=True,compression=2)

# Two fixed-size CGs interleaved in one DG exercise unsorted record IDs.
import struct
u = MDF(version='4.10')
u.append(Signal(np.array([1,2,3,4], dtype='i2'), t, name='A'), acq_name='First')
u.append(Signal(np.array([4.,3.,2.,1.], dtype='>f4'), t, name='B'), acq_name='Second')
path = out/'unsorted.mf4'
u.save(path, overwrite=True, compression=0)
raw = bytearray(path.read_bytes())
def links(address):
    count=struct.unpack_from('<Q',raw,address+16)[0]
    return list(struct.unpack_from('<'+'Q'*count,raw,address+24))
def body(address):
    return address+24+8*struct.unpack_from('<Q',raw,address+16)[0]
dg1=links(64)[0]
dg2,cg1,dt1,_=links(dg1)
_,cg2,dt2,_=links(dg2)
def records(cg,dt):
    size=struct.unpack_from('<I',raw,body(cg)+24)[0]
    count=struct.unpack_from('<Q',raw,body(cg)+8)[0]
    start=body(dt)
    return [raw[start+i*size:start+(i+1)*size] for i in range(count)]
payload=b''.join(b'\x01'+a+b'\x02'+b for a,b in zip(records(cg1,dt1),records(cg2,dt2)))
raw.extend(b'\0'*(-len(raw)%8))
address=len(raw)
raw.extend(bytes([35,35])+b'DT'+struct.pack('<IQQ',0,24+len(payload),0)+payload)
struct.pack_into('<Q',raw,dg1+24,0)
struct.pack_into('<Q',raw,dg1+40,address)
raw[body(dg1)]=1
struct.pack_into('<Q',raw,cg1+24,cg2)
struct.pack_into('<Q',raw,body(cg1),1)
struct.pack_into('<Q',raw,body(cg2),2)
path.write_bytes(raw)
# asammdf independently validates the hand-interleaved fixture.
check=MDF(path)
assert check.get('A').samples.tolist()==[1,2,3,4]
assert check.get('B').samples.tolist()==[4.,3.,2.,1.]
