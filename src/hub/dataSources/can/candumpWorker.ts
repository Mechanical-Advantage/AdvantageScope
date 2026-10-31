// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { runLazyWorker } from "../ImporterUtil";
import { createCandumpImporter } from "./CandumpImporter";

const importer = createCandumpImporter();
runLazyWorker(importer.start, importer.decode, importer.getLog);
