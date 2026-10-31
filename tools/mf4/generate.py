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
bus=np.zeros(4,dtype=[('CAN_DataFrame.BusChannel','u1'),('CAN_DataFrame.ID','<u4'),('CAN_DataFrame.IDE','u1'),('CAN_DataFrame.DLC','u1'),('CAN_DataFrame.DataLength','u1'),('CAN_DataFrame.DataBytes','u1',(8,))])
bus['CAN_DataFrame.ID']=0x0a5
bus['CAN_DataFrame.DLC']=8
bus['CAN_DataFrame.DataLength']=8
for i in range(4):bus['CAN_DataFrame.DataBytes'][i,2:4]=np.frombuffer((1000*(i+1)).to_bytes(2,'little'),dtype='u1')
b=MDF(version='4.10')
b.append(Signal(bus,t,name='CAN_DataFrame'),acq_name='CAN')
b.save(out/'bus.mf4',overwrite=True,compression=2)
