import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "TYPES BEGIN OF ENUM name STRUCTURE name2 BASE TYPE char01.",
];

statementType(tests, "TYPE BEGIN ENUM", Statements.TypeEnumBegin);