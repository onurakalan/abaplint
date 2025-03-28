import {expect} from "chai";
import * as Basic from "../../../src/abap/types/basic";
import {Registry} from "../../../src/registry";
import {TypedIdentifier, IdentifierMeta} from "../../../src/abap/types/_typed_identifier";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {ABAPObject} from "../../../src/objects/_abap_object";
import {Position} from "../../../src/position";
import {MemoryFile} from "../../../src/files/memory_file";
import {TableAccessType} from "../../../src/abap/types/basic";

function resolveVariable(abap: string, name: string): TypedIdentifier | undefined {
  const filename = "zfoobar.prog.abap";
  return runMulti([{filename: filename, contents: abap}], name);
}

function runMulti(files: {filename: string, contents: string}[], name: string): TypedIdentifier | undefined {
  const reg = new Registry();
  for (const file of files.reverse()) {
    reg.addFile(new MemoryFile(file.filename, file.contents));
  }
  reg.parse();
//  console.dir(reg.findIssues());

  const obj = reg.getFirstObject() as ABAPObject;
  const filename = files[0].filename;
  const scope = new SyntaxLogic(reg, obj).run().spaghetti.lookupPosition(new Position(1, 1), filename);
  return scope?.findVariable(name);
}

function expectStructure(identifier: TypedIdentifier | undefined) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(Basic.StructureType);
  const tab = identifier!.getType() as Basic.StructureType;
  return tab.getComponents();
}

function expectString(identifier: TypedIdentifier | undefined) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(Basic.StringType);
}

function expectVoid(identifier: TypedIdentifier | undefined) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(Basic.VoidType);
}

function expectTable(identifier: TypedIdentifier | undefined) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(Basic.TableType);
  const tab = identifier!.getType() as Basic.TableType;
  return tab.getRowType();
}

function expectInteger(identifier: TypedIdentifier | undefined) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(Basic.IntegerType);
}

function expectCharacter(identifier: TypedIdentifier | undefined, length: number) {
  expect(identifier).to.not.equals(undefined);
  expect(identifier!.getType()).to.be.instanceof(Basic.CharacterType);
  const type = identifier!.getType() as Basic.CharacterType;
  expect(type.getLength()).to.equal(length);
}

function expectConstantString(identifier: TypedIdentifier | undefined, value: string | undefined) {
  expectString(identifier);
  expect(identifier!.getValue()).to.equal(value);
  expect(identifier!.getMeta()).to.include(IdentifierMeta.ReadOnly);
}

function expectConstantCharacter(identifier: TypedIdentifier | undefined, value: string, length: number) {
  expectCharacter(identifier, length);
  expect(identifier!.getValue()).to.equal(value);
  expect(identifier!.getMeta()).to.include(IdentifierMeta.ReadOnly);
}

/////////////////////////////////////

describe("Basic Types", () => {

  it("nothing", () => {
    const abap = "WRITE foobar.";
    const identifier = resolveVariable(abap, "sdf");
    expect(identifier).to.equals(undefined);
  });

  it("DATA TYPE string", () => {
    const abap = "DATA foo TYPE string.";
    const identifier = resolveVariable(abap, "foo");
    expectString(identifier);
  });

  it("DATA TYPE c", () => {
    const abap = "DATA foo TYPE c.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 1);
  });

  it("DATA", () => {
    const abap = "DATA foo.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 1);
  });

  it("DATA TYPE i", () => {
    const abap = "DATA foo TYPE i.";
    const identifier = resolveVariable(abap, "foo");
    expectInteger(identifier);
  });

  it("DATA TYPE xstring", () => {
    const abap = "DATA foo TYPE xstring.";
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.XStringType);
  });

  it("DATA TYPE d", () => {
    const abap = "DATA foo TYPE d.";
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.DateType);
  });

  it("DATA TYPE t", () => {
    const abap = "DATA foo TYPE t.";
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.TimeType);
  });

  it("DATA TYPE n", () => {
    const abap = "DATA foo TYPE n.";
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.NumericType);
  });

  it("DATA TYPE x", () => {
    const abap = "DATA foo TYPE x.";
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.HexType);
  });

  it("CONSTANTS TYPE string", () => {
    const abap = "CONSTANTS foo TYPE string VALUE 'sdf'.";
    const identifier = resolveVariable(abap, "foo");
    expectConstantString(identifier, "'sdf'");
  });

  it("CONSTANTS TYPE string IS INITIAL", () => {
    const abap = "CONSTANTS foo TYPE string VALUE IS INITIAL.";
    const identifier = resolveVariable(abap, "foo");
    expectConstantString(identifier, undefined);
  });

  it("CONSTANTS TYPE string VALUE moo", () => {
    const abap = "CONSTANTS moo TYPE string VALUE '2'.\n" +
    "CONSTANTS foo TYPE string VALUE moo.";
    const identifier = resolveVariable(abap, "foo");
    expectConstantString(identifier, "'2'");
  });

  it("CONSTANTS only value", () => {
    const abap = "CONSTANTS moo VALUE 3.";
    const identifier = resolveVariable(abap, "moo");
    expectConstantCharacter(identifier, "3", 1);
  });

  it("DATA TYPE c, length 5", () => {
    const abap = "DATA foo TYPE c LENGTH 5.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 5);
  });

  it("DATA TYPE c, text length", () => {
    const abap = "DATA foo TYPE c LENGTH '5'.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 5);
  });

  it("DATA TYPE c, text length", () => {
    const abap = "DATA foo TYPE c LENGTH `5`.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 5);
  });

  it("DATA TYPE c, +5", () => {
    const abap = "DATA foo TYPE c LENGTH +5.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 5);
  });

  it("DATA TYPE c", () => {
    const abap =
      "CONSTANTS len TYPE i VALUE 5.\n" +
      "DATA foo TYPE c LENGTH len.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 5);
  });

  it("DATA TYPE c, pre, 5", () => {
    const abap = "DATA foo(5) TYPE c.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 5);
  });

  it("table, string", () => {
    const abap = "DATA tab TYPE STANDARD TABLE OF string.";
    const identifier = resolveVariable(abap, "tab");
    const rowType = expectTable(identifier);
    expect(rowType).to.be.instanceOf(Basic.StringType);
  });

  it("table, integer", () => {
    const abap = "DATA tab TYPE STANDARD TABLE OF i.";
    const identifier = resolveVariable(abap, "tab");
    const rowType = expectTable(identifier);
    expect(rowType).to.be.instanceOf(Basic.IntegerType);
  });

  it("data with defined type", () => {
    const abap =
      "TYPES typ TYPE i.\n" +
      "DATA foo TYPE typ.";
    const identifier = resolveVariable(abap, "foo");
    expectInteger(identifier);
  });

  it("DATA structured table", () => {
    const abap = `
      TYPES: BEGIN OF foo1,
               field TYPE i,
             END OF foo1.
      DATA tab TYPE STANDARD TABLE OF foo1 WITH EMPTY KEY.`;
    const type = resolveVariable(abap, "tab");
    const rowType = expectTable(type);
    expect(rowType).to.be.instanceof(Basic.StructureType);
    const stru = rowType as Basic.StructureType;
    const components = stru.getComponents();
    expect(components.length).to.equal(1);
    expect(components[0].name).to.equal("field");
  });

  it("ref to object", () => {
    const abap = `
    CLASS lcl_class DEFINITION.
    ENDCLASS.
    CLASS lcl_class IMPLEMENTATION.
    ENDCLASS.
    DATA lo_class TYPE REF TO lcl_class.`;
    const type = resolveVariable(abap, "lo_class");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.ObjectReferenceType);
  });

  it("ref to object, unknown", () => {
    const abap = `
    DATA lo_class TYPE REF TO lcl_sdfsdsdf.`;
    const type = resolveVariable(abap, "lo_class");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.UnknownType);
  });

  it("ref to interface", () => {
    const abap = `
    INTERFACE lif_foo.
    ENDINTERFACE.
    DATA li_intf TYPE REF TO lif_foo.`;
    const type = resolveVariable(abap, "li_intf");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.ObjectReferenceType);
  });

  it("ref to global class", () => {
    const clas = `
      CLASS zcl_global DEFINITION PUBLIC.
      ENDCLASS.
      CLASS zcl_global IMPLEMENTATION.
      ENDCLASS.`;
    const prog = `DATA lo_class TYPE REF TO zcl_global.`;
    const type = runMulti(
      [{filename: "zcl_global.clas.abap", contents: clas},
        {filename: "zfoobar.prog.abap", contents: prog}],
      "lo_class");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.ObjectReferenceType);
  });

  it("DATA abap_bool", () => {
    const abap = "DATA foo TYPE abap_bool.";
    const identifier = resolveVariable(abap, "foo");
    expectCharacter(identifier, 1);
  });

  it("DDIC data element", () => {
    const dtel = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDDIC</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000002</LENG>
    <OUTPUTLEN>000002</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const prog = `DATA foo TYPE zddic.`;
    const type = runMulti(
      [{filename: "zddic.dtel.xml", contents: dtel},
        {filename: "zfoobar.prog.abap", contents: prog}],
      "foo");
    expectCharacter(type, 2);
  });

  it("structured DATA, BEGIN OF", () => {
    const abap = `
    DATA: BEGIN OF foo,
      bar TYPE i,
    END OF foo.`;

    const identifier = resolveVariable(abap, "foo");
    const components = expectStructure(identifier);
    expect(components.length).to.equal(1);
    expect(components[0].name).to.equal("bar");
  });

  it("structured CONSTANTS, BEGIN OF", () => {
    const abap = `
    CONSTANTS:
      BEGIN OF bar,
        foo TYPE c LENGTH 1 VALUE 'a',
      END OF bar.`;

    const identifier = resolveVariable(abap, "bar");
    const components = expectStructure(identifier);
    expect(components.length).to.equal(1);
    expect(components[0].name).to.equal("foo");
  });

  it("structured CONSTANTS, BEGIN OF, nested", () => {
    const abap = `
    CONSTANTS:
      BEGIN OF bar,
        BEGIN OF loo,
          foo TYPE c LENGTH 1 VALUE 'a',
        END OF loo,
      END OF bar.`;

    const identifier = resolveVariable(abap, "bar");
    const components = expectStructure(identifier);
    expect(components.length).to.equal(1);
    expect(components[0].name).to.equal("loo");
  });

  it("structured DATA, BEGIN OF, nested", () => {
    const abap = `
    DATA:
      BEGIN OF foo,
        BEGIN OF bar,
          f TYPE string,
        END OF bar,
      END OF foo.`;

    const identifier = resolveVariable(abap, "foo");
    const components = expectStructure(identifier);
    expect(components.length).to.equal(1);
    expect(components[0].name).to.equal("bar");
  });

  it("Basic void", () => {
    const abap = "DATA foo TYPE void_type.";
    const identifier = resolveVariable(abap, "foo");
    expectVoid(identifier);
  });

  it("Basic void, LIKE LINE OF", () => {
    const abap = `
DATA: lt_keys TYPE void_something,
      ls_key  LIKE LINE OF lt_keys.`;
    const identifier = resolveVariable(abap, "ls_key");
    expectVoid(identifier);
  });

  it("LIKE LINE OF, error", () => {
    const abap = `
DATA: lt_keys TYPE i,
      ls_key  LIKE LINE OF lt_keys.`;  // "i" not a table type
    const identifier = resolveVariable(abap, "ls_key");
    expect(identifier?.getType()).to.be.instanceof(Basic.UnknownType);
  });

  it("LIKE LINE OF, i", () => {
    const abap = `
DATA: lt_keys TYPE STANDARD TABLE OF i,
      ls_key  LIKE LINE OF lt_keys.`;
    const identifier = resolveVariable(abap, "ls_key");
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("LIKE, i", () => {
    const abap = `
DATA: lv_i TYPE i,
      lv_foo LIKE lv_i.`;
    const identifier = resolveVariable(abap, "lv_foo");
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("LIKE, becomes void in a PROG", () => {
    const abap = `DATA lv_foo LIKE sdfsdsdfsdf.`;
    const identifier = resolveVariable(abap, "lv_foo");
    expect(identifier?.getType()).to.be.instanceof(Basic.VoidType);
  });

  it("basic field symbol", () => {
    const abap = `FIELD-SYMBOLS <foo> TYPE i.`;
    const identifier = resolveVariable(abap, "<foo>");
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("basic PARAMETER", () => {
    const abap = `PARAMETERS p_max TYPE i OBLIGATORY DEFAULT 100.`;
    const identifier = resolveVariable(abap, "p_max");
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("basic FORM", () => {
    const abap = `FORM select CHANGING import TYPE i.
ENDFORM.`;
    const identifier = resolveVariable(abap, "import");
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("FORM, ref to unknown", () => {
    const abap = `FORM output_integer USING io_value TYPE REF TO zcl_abappgp_integer.
ENDFORM.`;
    const identifier = resolveVariable(abap, "io_value");
    expect(identifier?.getType()).to.be.instanceof(Basic.UnknownType);
  });

  it("reference type defined in local class", () => {
    const abap = `CLASS lcl_foo DEFINITION.
  PUBLIC SECTION.
    TYPES: ty_foo TYPE i.
ENDCLASS.
DATA foobar TYPE lcl_foo=>ty_foo.`;
    const identifier = resolveVariable(abap, "foobar");
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("reference type defined in local interface", () => {
    const abap = `INTERFACE lif_foo.
  TYPES: ty_foo TYPE i.
ENDINTERFACE.
DATA foobar TYPE lif_foo=>ty_foo.`;
    const identifier = resolveVariable(abap, "foobar");
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("Something sub of void should be void", () => {
    const abap = `DATA lt_components TYPE cl_abap_structdescr=>component_table.`;
    const identifier = resolveVariable(abap, "lt_components");
    expect(identifier?.getType()).to.be.instanceof(Basic.VoidType);
  });

  it("void object reference", () => {
    const abap = `DATA lo_table TYPE REF TO cl_abap_tabledescr.`;
    const identifier = resolveVariable(abap, "lo_table");
    expect(identifier?.getType()).to.be.instanceof(Basic.VoidType);
  });

  it("object reference, interface, error expected", () => {
    const abap = `DATA: mi_ixml TYPE REF TO zif_ixml.`;
    const identifier = resolveVariable(abap, "mi_ixml");
    expect(identifier?.getType()).to.be.instanceof(Basic.UnknownType);
  });

  it("reference like defined in local class", () => {
    const abap = `CLASS lcl_foo DEFINITION.
  PUBLIC SECTION.
    DATA: foo TYPE i.
ENDCLASS.
DATA foobar LIKE lcl_foo=>foo.`;
    const identifier = resolveVariable(abap, "foobar");
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("data type table of void structure", () => {
    const abap = `
      TYPES ty_structures_tt TYPE STANDARD TABLE OF sstruc WITH NON-UNIQUE DEFAULT KEY.
      DATA foo TYPE ty_structures_tt.`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
  });

  it("TYPE TABLE OF REF TO", () => {
    const abap = `
CLASS lcl_foo DEFINITION.
ENDCLASS.
CLASS lcl_foo IMPLEMENTATION.
ENDCLASS.
DATA lt_nodes TYPE TABLE OF REF TO lcl_foo.`;
    const identifier = resolveVariable(abap, "lt_nodes");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.TableType);
  });

  it("basic SELECT-OPTIONS", () => {
    const abap = `
TABLES: rsdswhere.
SELECT-OPTIONS s_dyn FOR rsdswhere-line.`;
    const identifier = resolveVariable(abap, "s_dyn");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.TableType);
    const rowType = (identifier!.getType() as Basic.TableType).getRowType();
    expect(rowType).to.be.instanceof(Basic.StructureType);
  });

  it("LIKE LINE OF sub field", () => {
    const abap = `
TYPES: BEGIN OF ty_struc,
         piecelist TYPE STANDARD TABLE OF i WITH DEFAULT KEY,
       END OF ty_struc.
DATA: ls_struc TYPE ty_struc,
      lv_bar   LIKE LINE OF ls_struc-piecelist.`;
    const identifier = resolveVariable(abap, "lv_bar");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("ms_metadata", () => {
    const abap = `DATA ms_metadata TYPE zif_abapgit_definitions=>ty_metadata.`;
    const identifier = resolveVariable(abap, "ms_metadata");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.UnknownType);
  });

  it("LIKE sy", () => {
    const abap = `DATA sdf LIKE sy.`;
    const identifier = resolveVariable(abap, "sdf");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.StructureType);
  });

  it("nested", () => {
    const abap = `TYPES: BEGIN OF ty_type1,
  type1 TYPE i,
END OF ty_type1.
TYPES: BEGIN OF ty_type2,
  type2 TYPE ty_type1,
END OF ty_type2.
DATA foo TYPE ty_type2-type2-type1.`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("nested, with interface", () => {
    const abap = `INTERFACE lif_interface.
  TYPES: BEGIN OF ty_type1,
           type1 TYPE i,
         END OF ty_type1.
  TYPES: BEGIN OF ty_type2,
           type2 TYPE ty_type1,
         END OF ty_type2.
ENDINTERFACE.
DATA foo TYPE lif_interface=>ty_type2-type2-type1.`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("expect void", () => {
    const abap = `DATA lv_button1 TYPE svalbutton-buttontext.`;
    const identifier = resolveVariable(abap, "lv_button1");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.VoidType);
  });

  it("LIKE STANDARD TABLE", () => {
    const abap = `
      DATA boo TYPE i.
      DATA foo LIKE STANDARD TABLE OF boo.`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
    const row = (identifier!.getType() as Basic.TableType).getRowType();
    expect(row).to.be.instanceof(Basic.IntegerType);
  });

  it("TYPE RANGE OF", () => {
    const abap = `DATA lt_range TYPE RANGE OF devclass.`;
    const identifier = resolveVariable(abap, "lt_range");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
  });

  it("Field symbol TYPE LINE OF", () => {
    const abap = `
    TYPES: ty_foo TYPE STANDARD TABLE OF i.
    FIELD-SYMBOLS <bar> TYPE LINE OF ty_foo.`;
    const identifier = resolveVariable(abap, "<bar>");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("LIKE from super class", () => {
    const abap = `
CLASS lcl_super DEFINITION.
  PUBLIC SECTION.
    DATA: foo TYPE i.
ENDCLASS.
CLASS lcl_super IMPLEMENTATION.
ENDCLASS.

CLASS lcl_sub DEFINITION INHERITING FROM lcl_super.
  PUBLIC SECTION.
    DATA: bar LIKE foo.
ENDCLASS.
CLASS lcl_sub IMPLEMENTATION.
ENDCLASS.

DATA moo LIKE lcl_sub=>bar.`;
    const identifier = resolveVariable(abap, "moo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("LIKE, internal class definition", () => {
    const abap = `
CLASS lcl_sub DEFINITION.
  PUBLIC SECTION.
    DATA foo TYPE i.
    DATA bar LIKE foo.
ENDCLASS.
CLASS lcl_sub IMPLEMENTATION.
ENDCLASS.

DATA moo LIKE lcl_sub=>bar.`;
    const identifier = resolveVariable(abap, "moo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("TYPE from super class", () => {
    const abap = `
  CLASS lcl_super DEFINITION.
    PUBLIC SECTION.
      TYPES: ty_foo TYPE i.
  ENDCLASS.
  CLASS lcl_super IMPLEMENTATION.
  ENDCLASS.

  CLASS lcl_sub DEFINITION INHERITING FROM lcl_super.
    PUBLIC SECTION.
      DATA: bar TYPE ty_foo.
  ENDCLASS.
  CLASS lcl_sub IMPLEMENTATION.
  ENDCLASS.

  DATA moo LIKE lcl_sub=>bar.`;
    const identifier = resolveVariable(abap, "moo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("TYPE from super super class", () => {
    const abap = `
CLASS lcl_supersuper DEFINITION.
  PUBLIC SECTION.
    TYPES: ty_foo TYPE i.
ENDCLASS.
CLASS lcl_supersuper IMPLEMENTATION.
ENDCLASS.

CLASS lcl_super DEFINITION INHERITING FROM lcl_supersuper.
ENDCLASS.
CLASS lcl_super IMPLEMENTATION.
ENDCLASS.

CLASS lcl_sub DEFINITION INHERITING FROM lcl_super.
  PUBLIC SECTION.
    DATA: bar TYPE ty_foo.
ENDCLASS.
CLASS lcl_sub IMPLEMENTATION.
ENDCLASS.

DATA moo LIKE lcl_sub=>bar.`;
    const identifier = resolveVariable(abap, "moo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("TYPE REF TO data", () => {
    const abap = `
TYPES:
  BEGIN OF ty_named_collection,
    name TYPE string,
  END OF ty_named_collection.
DATA lr_collection TYPE REF TO ty_named_collection.`;
    const identifier = resolveVariable(abap, "lr_collection");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.DataReference);
  });

  it("SELECTION-SCREEN TITLE", () => {
    const abap = `
  SELECTION-SCREEN BEGIN OF SCREEN 1002 TITLE s_title.
  SELECTION-SCREEN END OF SCREEN 1002.
  s_title = 'abc'.`;
    const identifier = resolveVariable(abap, "s_title");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.CharacterType);
  });

  it("LIKE LINE OF lo_node->", () => {
    const abap = `
CLASS lcl_node DEFINITION.
  PUBLIC SECTION.
    DATA: mt_edges TYPE STANDARD TABLE OF i.
ENDCLASS.
CLASS lcl_node IMPLEMENTATION.
ENDCLASS.
DATA: lo_node TYPE REF TO lcl_node,
      lv_edge LIKE LINE OF lo_node->mt_edges.`;
    const identifier = resolveVariable(abap, "lv_edge");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("LIKE LINE OF lo_node->, but void", () => {
    const abap = `
DATA: lo_node TYPE REF TO cl_void,
      lv_edge LIKE LINE OF lo_node->mt_edges.`;
    const identifier = resolveVariable(abap, "lv_edge");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.VoidType);
  });

  it("INTERFACE DEFERRED", () => {
    const abap = `
INTERFACE lif_foo DEFERRED.
DATA foo TYPE REF TO lif_foo.
INTERFACE lif_foo.
ENDINTERFACE.`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.ObjectReferenceType);
  });

  it("CLASS DEFERRED", () => {
    const abap = `
CLASS lcl_bar DEFINITION DEFERRED.
DATA bar TYPE REF TO lcl_bar.
CLASS lcl_bar DEFINITION.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.`;
    const identifier = resolveVariable(abap, "bar");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.ObjectReferenceType);
  });

  it("LIKE LINE OF should inherit the void name, 1", () => {
    const abap = `
    DATA lt_stab TYPE abap_trans_srcbind_tab.
    FIELD-SYMBOLS <ls_stab> LIKE LINE OF lt_stab.`;
    const identifier = resolveVariable(abap, "<ls_stab>");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.VoidType);
    expect((type as Basic.VoidType).getVoided()?.toLowerCase()).to.equal("abap_trans_srcbind_tab");
  });

  it("LIKE LINE OF should inherit the void name, 2", () => {
    const abap = `
    DATA lo_zip TYPE REF TO cl_abap_zip.
    FIELD-SYMBOLS <ls_zipfile> LIKE LINE OF lo_zip->files.`;
    const identifier = resolveVariable(abap, "<ls_zipfile>");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.VoidType);
    expect((type as Basic.VoidType).getVoided()?.toLowerCase()).to.equal("cl_abap_zip");
  });

  it("Packed, 1", () => {
    const abap = `
    DATA foo TYPE p.`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.PackedType);
    const p = type as Basic.PackedType;
    expect(p.getLength()).to.equal(1);
    expect(p.getDecimals()).to.equal(0);
  });

  it("Packed, 2", () => {
    const abap = `
    DATA foo TYPE p LENGTH 5.`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.PackedType);
    const p = type as Basic.PackedType;
    expect(p.getLength()).to.equal(5);
    expect(p.getDecimals()).to.equal(0);
  });

  it("Packed, 3", () => {
    const abap = `
    DATA foo TYPE p LENGTH 5 DECIMALS 2.`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.PackedType);
    const p = type as Basic.PackedType;
    expect(p.getLength()).to.equal(5);
    expect(p.getDecimals()).to.equal(2);
  });

  it("TYPE sy-index", () => {
    const abap = `
    DATA foo TYPE sy-index.`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.IntegerType);
  });

  it("DATA foo TYPE REF TO object.", () => {
    const abap = `
    DATA foo TYPE REF TO object.`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.GenericObjectReferenceType);
    expect(type?.isGeneric()).to.equal(false);
  });

  it("DATA foo TYPE REF TO data.", () => {
    const abap = `
    DATA foo TYPE REF TO data.`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.DataReference);
    expect(type?.isGeneric()).to.equal(false);
  });

  it("sy-datum", () => {
    const abap = `
    DATA foo TYPE sy-datum.`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.DateType);
  });

  it("sy-uzeit", () => {
    const abap = `DATA foo TYPE sy-uzeit.`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.TimeType);
  });

  it("TYPE STANDARD TABLE", () => {
    const abap = `FIELD-SYMBOLS: <lt_itab> TYPE STANDARD TABLE.`;
    const identifier = resolveVariable(abap, "<lt_itab>");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.TableType);
  });

  it("Inline DATA definition", () => {
    const abap = `DATA(lo_instance) = cl_oo_factory=>create_instance( ).`;
    const identifier = resolveVariable(abap, "lo_instance");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.VoidType);
  });

  it("Inline DATA definition", () => {
    const abap = `DATA(foobar) = 2.`;
    const identifier = resolveVariable(abap, "foobar");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("Inline object ref", () => {
    const abap = `
  CLASS lcl_foo DEFINITION.
  ENDCLASS.
  CLASS lcl_foo IMPLEMENTATION.
  ENDCLASS.
  DATA(lo_initial) = NEW lcl_foo( ).`;
    const identifier = resolveVariable(abap, "lo_initial");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.ObjectReferenceType);
  });

  it("CAST void types", () => {
    const abap = `DATA(li_source) = CAST if_oo_clif_source( cl_global=>bar( ) ).`;
    const identifier = resolveVariable(abap, "li_source");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.VoidType);
  });

  it("CATCH into DATA", () => {
    const abap = `
TRY.
  CATCH cx_static_check INTO DATA(lx_error).
ENDTRY.`;
    const identifier = resolveVariable(abap, "lx_error");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.VoidType);
  });

  it("Anything from voided type should give void", () => {
    const abap = `
  DATA lo_void TYPE REF TO cl_voided.
  DATA(lo_findings) = lo_void->findings.`;
    const identifier = resolveVariable(abap, "lo_findings");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.VoidType);
  });

  it("Anything from voided type should give void, 2", () => {
    const abap = `DATA(foo) = cl_voided=>field.`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.VoidType);
  });

  it("LOOP into inline", () => {
    const abap = `DATA tab TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  LOOP AT tab INTO DATA(row).
  ENDLOOP.`;
    const identifier = resolveVariable(abap, "row");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.StringType);
  });

  it("LOOP into inline fieldsymbol", () => {
    const abap = `
  DATA tab TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  LOOP AT tab INTO FIELD-SYMBOL(<row>).
  ENDLOOP.`;
    const identifier = resolveVariable(abap, "<row>");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.StringType);
  });

  it("Infer string type from string template", () => {
    const abap = `DATA(lv_name) = |sdfsdfsd|.`;
    const identifier = resolveVariable(abap, "lv_name");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.StringType);
  });

  it("Infer integer type from integer", () => {
    const abap = `DATA(lv_name) = 123.`;
    const identifier = resolveVariable(abap, "lv_name");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.IntegerType);
  });

  it("Infer type from interface constant", () => {
    const abap = `INTERFACE lif_def.
  CONSTANTS foo TYPE c VALUE '1'.
ENDINTERFACE.
DATA(bar) = lif_def=>foo.`;
    const identifier = resolveVariable(abap, "bar");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.CharacterType);
  });

  it("Voided chain", () => {
    const abap = `DATA lo_void TYPE REF TO cl_anysomething.
    DATA(sdf) = lo_void->method( )->attribute->method( ).`;
    const identifier = resolveVariable(abap, "sdf");
    expect(identifier).to.not.equal(undefined);
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.VoidType);
  });

  it("Data reference", () => {
    const abap = `
INTERFACE lif_bar.
  TYPES: type TYPE string.
ENDINTERFACE.
DATA moo TYPE REF TO lif_bar=>type.`;
    const type = resolveVariable(abap, "moo");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.DataReference);
  });

  it("TYPE ANY TABLE", () => {
    const abap = `FIELD-SYMBOLS <lt_any> TYPE ANY TABLE.`;
    const type = resolveVariable(abap, "<lt_any>");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.TableType);
  });

  it("TYPE INDEX TABLE", () => {
    const abap = `FIELD-SYMBOLS <lt_index> TYPE INDEX TABLE.`;
    const type = resolveVariable(abap, "<lt_index>");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.TableType);
  });

  it("READ TABLE INTO inline data", () => {
    const abap = `
      DATA lt_bar TYPE STANDARD TABLE OF string WITH EMPTY KEY.
      READ TABLE lt_bar INTO DATA(lv_bar) INDEX 1.`;
    const type = resolveVariable(abap, "lv_bar");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.StringType);
  });

  it("SELECT from voided table to inline definition", () => {
    const abap = `SELECT * FROM sdfsd INTO TABLE @DATA(lt_tab).`;
    const type = resolveVariable(abap, "lt_tab");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.VoidType);
  });

  it("SELECT SINGLE, voided", () => {
    const abap = `SELECT SINGLE * FROM something INTO @DATA(ls_data).`;
    const type = resolveVariable(abap, "ls_data");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.VoidType);
  });

  it("call chain inline integer", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_bar,
             field TYPE i,
           END OF ty_bar.
    CLASS-METHODS: method RETURNING VALUE(val) TYPE ty_bar.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD method.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA(bar) = lcl_bar=>method( )-field.`;
    const type = resolveVariable(abap, "bar");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("field chain with table expression", () => {
    const abap = `
TYPES: BEGIN OF ty_bar,
         name  TYPE string,
         value TYPE i,
       END OF ty_bar.
DATA lt_params TYPE STANDARD TABLE OF ty_bar WITH EMPTY KEY.
DATA(lv_len) = lt_params[ name = 'filesize' ]-value.`;
    const type = resolveVariable(abap, "lv_len");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("Source type VALUE", () => {
    const abap = `
TYPES: BEGIN OF ty_foo,
  bar TYPE i,
END OF ty_foo.
DATA(bar) = VALUE ty_foo( bar = 2 ).`;
    const type = resolveVariable(abap, "bar");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.StructureType);
  });

  it("SELECTION-SCREEN COMMENT", () => {
    const abap = `
SELECTION-SCREEN COMMENT /1(55) s_cmnt.
s_cmnt = 'Comment'.`;
    const identifier = resolveVariable(abap, "s_cmnt");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.CharacterType);
  });

  it("SELECTION-SCREEN PUSHBUTTON", () => {
    const abap = `
SELECTION-SCREEN PUSHBUTTON /1(55) s_butt USER-COMMAND butt.
s_butt = 'Button'.`;
    const identifier = resolveVariable(abap, "s_butt");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.CharacterType);
  });

  it("INSERT INTO TABLE ASSIGNING inline", () => {
    const abap = `
DATA: lt_list TYPE STANDARD TABLE OF string,
      lv_list LIKE LINE OF lt_list.
INSERT lv_list INTO TABLE lt_list ASSIGNING FIELD-SYMBOL(<lv_list>).`;
    const identifier = resolveVariable(abap, "<lv_list>");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.StringType);
  });

  it("READ TABLE ASSIGNING inline", () => {
    const abap = `
TYPES: BEGIN OF ty_path,
         path TYPE string,
       END OF ty_path.
DATA: lt_paths TYPE STANDARD TABLE OF ty_path.
READ TABLE lt_paths ASSIGNING FIELD-SYMBOL(<ls_path>) WITH KEY path = 'foobar'.`;
    const identifier = resolveVariable(abap, "<ls_path>");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.StructureType);
  });

  it("inline CONV xstring", () => {
    const abap = `DATA(lv_hex) = CONV xstring( '11' ).`;
    const identifier = resolveVariable(abap, "lv_hex");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.XStringType);
  });

  it("SPLIT INTO TABLE inline", () => {
    const abap = `DATA lv_field TYPE string.
    SPLIT lv_field AT 'abc' INTO TABLE DATA(lt_field).`;
    const identifier = resolveVariable(abap, "lt_field");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
  });

  it("inline CORRESPONDING", () => {
    const abap = `
TYPES: BEGIN OF ty_path,
         path TYPE string,
       END OF ty_path.
DATA bar TYPE ty_path.
DATA(foo) = CORRESPONDING ty_path( bar ).`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.StructureType);
  });

  it("ASSIGN inline, with table expression", () => {
    const abap = `
TYPES: BEGIN OF ty_path,
  path TYPE string,
END OF ty_path.
DATA mt_table TYPE STANDARD TABLE OF ty_path WITH EMPTY KEY.
ASSIGN mt_table[ path = 'abc' ] TO FIELD-SYMBOL(<ls_row>).`;
    const identifier = resolveVariable(abap, "<ls_row>");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.StructureType);
  });

  it("CONVERT TIME STAMP", () => {
    const abap = `
DATA foo TYPE timestamp.
CONVERT TIME STAMP foo TIME ZONE '123' INTO DATE DATA(date) TIME DATA(time).`;
    const identifier1 = resolveVariable(abap, "date");
    expect(identifier1).to.not.equal(undefined);
    expect(identifier1?.getType()).to.be.instanceof(Basic.DateType);

    const identifier2 = resolveVariable(abap, "time");
    expect(identifier2).to.not.equal(undefined);
    expect(identifier2?.getType()).to.be.instanceof(Basic.TimeType);
  });

  it("EXACT", () => {
    const abap = `
TYPES ty_bar TYPE c LENGTH 10.
DATA(fsdf) = EXACT ty_bar( |sdfs| ).`;
    const identifier = resolveVariable(abap, "fsdf");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.CharacterType);
  });

  it("COND", () => {
    const abap = `DATA(fsdf) = COND string( WHEN 1 < 2 THEN |sdf| ).`;
    const identifier = resolveVariable(abap, "fsdf");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.StringType);
  });

  it("COND 2", () => {
    const abap = `DATA(cond) = COND #( WHEN 1 = 2 THEN |foo| WHEN 2 = 2 THEN |bar| ).`;
    const identifier = resolveVariable(abap, "cond");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.StringType);
  });

  it("SWITCH", () => {
    const abap = `DATA(sdf) = SWITCH string( sy-index WHEN 1 THEN 'sdfsdf' ).`;
    const identifier = resolveVariable(abap, "sdf");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.StringType);
  });

  it("DESCRIBE TABLE inline", () => {
    const abap = `
DATA lt_table TYPE STANDARD TABLE OF string WITH EMPTY KEY.
DESCRIBE TABLE lt_table LINES DATA(lv_lines).`;
    const identifier = resolveVariable(abap, "lv_lines");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("FIND REGEX inline", () => {
    const abap = `
  DATA lv_path TYPE string.
  FIND REGEX |^bar$| IN lv_path SUBMATCHES DATA(lv_match).`;
    const identifier = resolveVariable(abap, "lv_match");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.StringType);
  });

  it("MESSAGE INTO inline", () => {
    const abap = `
    MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno INTO DATA(lv_message) WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4.`;
    const identifier = resolveVariable(abap, "lv_message");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.StringType);
  });

  it("GET TIME STAMP inline", () => {
    const abap = `GET TIME STAMP FIELD DATA(lv_current).`;
    const identifier = resolveVariable(abap, "lv_current");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.PackedType);
  });

  it("GET PARAMETER inline", () => {
    const abap = `GET PARAMETER ID 'FOOBAR' FIELD DATA(lv_foo).`;
    const identifier = resolveVariable(abap, "lv_foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.CharacterType);
  });

  it("FIND REGEX inline, multiple submatches", () => {
    const abap = `
  DATA lv_path TYPE string.
  FIND REGEX |^bar$| IN lv_path SUBMATCHES DATA(lv_match1) DATA(lv_match2).`;
    const identifier = resolveVariable(abap, "lv_match2");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.StringType);
  });

  it("inline RECEIVING", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS: moo RETURNING VALUE(val) TYPE i.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD moo.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  lcl_bar=>moo( RECEIVING val = DATA(val) ).`;
    const identifier = resolveVariable(abap, "val");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("OCCURS 0 WITH HEADER LINE", () => {
    const abap = `DATA tab TYPE i OCCURS 0 WITH HEADER LINE.`;
    const identifier = resolveVariable(abap, "tab");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
  });

  it("OCCURS 0 WITH HEADER LINE, lower case", () => {
    const abap = `DATA tab TYPE i OCCURS 0 with header line.`;
    const identifier = resolveVariable(abap, "tab");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
    const type = identifier!.getType() as Basic.TableType;
    expect(type.isWithHeader()).to.equal(true);
  });

  it("WHEN TYPE", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.
DATA lo_bar TYPE REF TO lcl_bar.
CASE TYPE OF lo_bar.
  WHEN TYPE lcl_bar INTO DATA(lo_foo).
ENDCASE.`;
    const identifier = resolveVariable(abap, "lo_foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.ObjectReferenceType);
  });

  it("LIKE OCCURS 0 WITH HEADER LINE", () => {
    const abap = `
    DATA line TYPE i.
    DATA tab LIKE line OCCURS 0 WITH HEADER LINE.
    `;
    const identifier = resolveVariable(abap, "tab");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
  });

  const zstructure1 = `
  <?xml version="1.0" encoding="utf-8"?>
  <abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
   <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
     <DD02V>
      <TABNAME>ZSTRUCTURE1</TABNAME>
      <DDLANGUAGE>E</DDLANGUAGE>
      <TABCLASS>INTTAB</TABCLASS>
      <DDTEXT>sdf</DDTEXT>
      <EXCLASS>1</EXCLASS>
     </DD02V>
     <DD03P_TABLE>
      <DD03P>
       <TABNAME>ZSTRUCTURE1</TABNAME>
       <FIELDNAME>FOOBAR</FIELDNAME>
       <DDLANGUAGE>E</DDLANGUAGE>
       <POSITION>0001</POSITION>
       <ADMINFIELD>0</ADMINFIELD>
       <INTTYPE>C</INTTYPE>
       <INTLEN>000004</INTLEN>
       <DATATYPE>CHAR</DATATYPE>
       <LENG>000002</LENG>
       <MASK>  CHAR</MASK>
      </DD03P>
     </DD03P_TABLE>
    </asx:values>
   </asx:abap>
  </abapGit>`;

  it("LIKE DDIC structure", () => {
    const prog = `DATA foo LIKE zstructure1-foobar.`;
    const type = runMulti(
      [{filename: "zstructure1.tabl.xml", contents: zstructure1},
        {filename: "zfoobar.prog.abap", contents: prog}],
      "foo");
    expectCharacter(type, 2);
  });

  it("TABLES", () => {
    const prog = `TABLES zstructure1.`;
    const type = runMulti(
      [{filename: "zstructure1.tabl.xml", contents: zstructure1},
        {filename: "zfoobar.prog.abap", contents: prog}],
      "zstructure1");
    expect(type?.getType()).to.be.instanceof(Basic.StructureType);
  });

  it("TABLES with star", () => {
    const prog = `TABLES *zstructure1.`;
    const type = runMulti(
      [{filename: "zstructure1.tabl.xml", contents: zstructure1},
        {filename: "zfoobar.prog.abap", contents: prog}],
      "*zstructure1");
    expect(type?.getType()).to.be.instanceof(Basic.StructureType);
  });

  it("LIKE DDIC 2", () => {
    const prog = `DATA foo LIKE zstructure1.`;
    const type = runMulti(
      [{filename: "zstructure1.tabl.xml", contents: zstructure1},
        {filename: "zfoobar.prog.abap", contents: prog}],
      "foo");
    expectStructure(type);
  });

  it("Inline VALUE table comprehension", () => {
    const abap = `
    DATA tab TYPE STANDARD TABLE OF i WITH EMPTY KEY.
    DATA(line) = VALUE #( tab[ 1 ] ).
    `;
    const identifier = resolveVariable(abap, "line");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("boolc inline", () => {
    const abap = `DATA(foo) = boolc( 1 = 2 ).`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.StringType);
  });

  it("xsdbool inline", () => {
    const abap = `DATA(foo) = xsdbool( 1 = 2 ).`;
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.CharacterType);
  });

  it("FIND RESULTS inline", () => {
    const abap = `
    DATA lv_string TYPE string.
    FIND ALL OCCURRENCES OF REGEX  'bar' IN lv_string RESULTS DATA(blanks).`;
    const identifier = resolveVariable(abap, "blanks");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
  });

  it("VALUE with FOR inline", () => {
    const abap = `
    TYPES ty_integers TYPE STANDARD TABLE OF i WITH EMPTY KEY.
    DATA lt_integers TYPE ty_integers.
    DATA(copy) = VALUE ty_integers( FOR lv_int IN lt_integers ( lv_int ) ).`;
    const identifier = resolveVariable(abap, "copy");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
  });

  it("FORM, CHANGING STRUCTURE", () => {
    const abap = `FORM foo CHANGING bar STRUCTURE sy.
    ENDFORM.`;
    const identifier = resolveVariable(abap, "bar");
    expect(identifier?.getType()).to.be.instanceof(Basic.StructureType);
  });

  it("DATA BEGIN OF, INCLUDE voided structure", () => {
    const abap = `DATA BEGIN OF stru.
    INCLUDE STRUCTURE something_void.
    DATA END OF stru.`;
    const identifier = resolveVariable(abap, "stru");
    expect(identifier?.getType()).to.be.instanceof(Basic.VoidType);
  });

  it("DATA BEGIN OF, OCCURS", () => {
    const abap = `DATA BEGIN OF tab OCCURS 10.
    DATA too TYPE c.
    DATA END OF tab.`;
    const identifier = resolveVariable(abap, "tab");
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
  });

  it("DATA BEGIN OF, OCCURS, lower case", () => {
    const abap = `
    data: begin of tb_path occurs 10,
            path TYPE string,
          end of tb_path.`;
    const identifier = resolveVariable(abap, "tb_path");
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
  });

  it("DATA BEGIN OF OCCURS, INCLUDE voided structure", () => {
    const abap = `DATA BEGIN OF tables_tab OCCURS 10.
    INCLUDE STRUCTURE something_void.
    DATA END OF tables_tab.`;
    const identifier = resolveVariable(abap, "tables_tab");
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
  });

  it("DATA BEGIN OF, OCCURS", () => {
    const abap = `
TYPES: BEGIN OF ty_bar,
         sdf TYPE c LENGTH 1,
       END OF ty_bar.

DATA BEGIN OF stru.
INCLUDE TYPE ty_bar.
DATA END OF stru.`;
    const identifier = resolveVariable(abap, "stru");
    expect(identifier?.getType()).to.be.instanceof(Basic.StructureType);
    const type = identifier!.getType() as Basic.StructureType;
    expect(type.getComponents().length).to.equal(1);
  });

  it("table with header line", () => {
    const abap = `
TYPES: BEGIN OF ty_structure,
         bar TYPE string,
       END OF ty_structure.
DATA bar TYPE TABLE OF ty_structure WITH HEADER LINE.`;
    const identifier = resolveVariable(abap, "bar");
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.TableType);
    const tt = type as Basic.TableType;
    expect(tt.isWithHeader()).to.equal(true);
  });

  it("table with header line, OCCURS", () => {
    const abap = `
TYPES: BEGIN OF ty_log,
         msgv1 TYPE string,
       END OF ty_log.
DATA joblog TYPE ty_log OCCURS 0 WITH HEADER LINE.`;
    const identifier = resolveVariable(abap, "joblog");
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.TableType);
    const tt = type as Basic.TableType;
    expect(tt.isWithHeader()).to.equal(true);
  });

  it("LIKE refering to header line typing", () => {
    const abap = `
TYPES: BEGIN OF ty_type,
         foo TYPE string,
       END OF ty_type.
DATA tab TYPE TABLE OF ty_type WITH HEADER LINE.
DATA moo LIKE tab-foo.`;
    const identifier = resolveVariable(abap, "moo");
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.StringType);
  });

  it("constant with value from interface", () => {
    const abap = `
INTERFACE lif_bar.
  CONSTANTS sdf TYPE c LENGTH 1 VALUE 'a'.
ENDINTERFACE.
CONSTANTS something TYPE c LENGTH 1 VALUE lif_bar=>sdf.`;
    const identifier = resolveVariable(abap, "something");
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.CharacterType);
  });

  it("dereference data reference via star", () => {
    const abap = `
TYPES: BEGIN OF ty_bar,
         int TYPE i,
       END OF ty_bar.
DATA ref TYPE REF TO ty_bar.
DATA(sdf) = ref->*-int.`;
    const identifier = resolveVariable(abap, "sdf");
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.IntegerType);
  });

  it("FORM, CHANGING STRUCTURE", () => {
    const abap = `FORM foobar CHANGING tab TYPE ANY TABLE.
    ENDFORM.`;
    const identifier = resolveVariable(abap, "tab");
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
  });

  it("loop at ANY should give ANY", () => {
    const abap = `
    FIELD-SYMBOLS <tab> TYPE ANY TABLE.
    LOOP AT <tab> ASSIGNING FIELD-SYMBOL(<sdf>).
    ENDLOOP.`;
    const identifier = resolveVariable(abap, "<sdf>");
    expect(identifier?.getType()).to.be.instanceof(Basic.AnyType);
  });

  it("data reference via NEW", () => {
    const abap = `DATA(sdf) = NEW abap_bool( abap_true ).`;
    const identifier = resolveVariable(abap, "sdf");
    expect(identifier?.getType()).to.be.instanceof(Basic.DataReference);
  });

  it("DATA like table body", () => {
    const abap = `
    DATA int TYPE i.
    RANGES foo FOR int.
    DATA bar LIKE foo[].`;
    const identifier = resolveVariable(abap, "bar");
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.TableType);
    expect((type as Basic.TableType).isWithHeader()).to.equal(false);
  });

  it("DATA with old style length", () => {
    const abap = `DATA foo(15).`;
    const identifier = resolveVariable(abap, "foo");
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.CharacterType);
    expect((type as Basic.CharacterType).getLength()).to.equal(15);
  });

  it("Basic FILTER", () => {
    const abap = `
    TYPES ty_tab TYPE SORTED TABLE OF i WITH NON-UNIQUE DEFAULT KEY.
    DATA table TYPE ty_tab.
    DATA(res) = FILTER ty_tab( table WHERE table_line = 1 ).`;
    const identifier = resolveVariable(abap, "res");
    const type = identifier?.getType();
    expect(type).to.be.instanceof(Basic.TableType);
  });

  it("DATA TYPE int8", () => {
    const abap = "DATA foo TYPE int8.";
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("DATA TYPE utclong", () => {
    const abap = "DATA foo TYPE utclong.";
    const identifier = resolveVariable(abap, "foo");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.UTCLongType);
  });

  it("decfloat34", () => {
    const abap = `DATA my_decfloat34 TYPE decfloat34.`;
    const identifier = resolveVariable(abap, "my_decfloat34");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.DecFloat34Type);
  });

  it("decfloat16", () => {
    const abap = `DATA my_decfloat16 TYPE decfloat16.`;
    const identifier = resolveVariable(abap, "my_decfloat16");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.DecFloat16Type);
  });

  it("DDIC TTYP", () => {
    const dtel = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZAG_UNIT_TEST_TT</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <ROWTYPE>TADIR</ROWTYPE>
    <ROWKIND>S</ROWKIND>
    <DATATYPE>STRU</DATATYPE>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <DDTEXT>unit test</DDTEXT>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const prog = `DATA foo TYPE LINE OF zag_unit_test_tt.`;
    const type = runMulti(
      [{filename: "zag_unit_test_tt.ttyp.xml", contents: dtel},
        {filename: "zfoobar.prog.abap", contents: prog}],
      "foo");
    expect(type?.getType()).to.be.instanceof(Basic.VoidType);
  });

  it("FIND REGEX inline", () => {
    const abap = `FIND REGEX 'sdf' IN 'sdf' MATCH OFFSET DATA(lv_offset) MATCH LENGTH DATA(lv_length) SUBMATCHES DATA(lv_bar).`;
    {
      const identifier = resolveVariable(abap, "lv_offset");
      expect(identifier).to.not.equal(undefined);
      expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
    }
    {
      const identifier = resolveVariable(abap, "lv_length");
      expect(identifier).to.not.equal(undefined);
      expect(identifier?.getType()).to.be.instanceof(Basic.IntegerType);
    }
    {
      const identifier = resolveVariable(abap, "lv_bar");
      expect(identifier).to.not.equal(undefined);
      expect(identifier?.getType()).to.be.instanceof(Basic.StringType);
    }
  });

  it("Infer REF type", () => {
    const abap = `
    DATA lv_xyz TYPE abap_bool.
    DATA(lr_data) = REF #( lv_xyz ).`;
    const identifier = resolveVariable(abap, "lr_data");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.DataReference);
  });

  it("Chained statment", () => {
    const abap = `
  CLASS lcl DEFINITION.
    PUBLIC SECTION.
      DATA moo TYPE i.
      METHODS bar RETURNING VALUE(ref) TYPE REF TO lcl.
  ENDCLASS.
  CLASS lcl IMPLEMENTATION.
    METHOD bar.
    ENDMETHOD.
  ENDCLASS.

  START-OF-SELECTION.
    DATA(sdf) = NEW lcl( )->bar( )->moo.`;
    const identifier = resolveVariable(abap, "sdf");
    expect(identifier).to.not.equal(undefined);
    expect(identifier!.getType()).to.be.instanceof(Basic.IntegerType);
  });

  it("SIMPLE", () => {
    const abap = `
    FIELD-SYMBOLS <bar> TYPE simple.`;
    const identifier = resolveVariable(abap, "<bar>");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.SimpleType);
  });

  it("TABLE", () => {
    const abap = `
    FIELD-SYMBOLS <bar> TYPE table.`;
    const identifier = resolveVariable(abap, "<bar>");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
  });

  it("C Pointer", () => {
    const abap = `
  DATA bar TYPE %_c_pointer.`;
    const identifier = resolveVariable(abap, "bar");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.HexType);
  });

  it("DATA tab TYPE SORTED TABLE OF i WITH UNIQUE KEY table_line.", () => {
    const abap = `DATA tab TYPE SORTED TABLE OF i WITH UNIQUE KEY table_line.`;
    const identifier = resolveVariable(abap, "tab");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
    const type = identifier!.getType() as Basic.TableType;
    expect(type.isWithHeader()).to.equal(false);
    expect(type.getOptions().primaryKey?.keyFields).to.have.all.members(["TABLE_LINE"]);
  });

  it("table, two key fields", () => {
    const abap = `
TYPES: BEGIN OF type,
         int  TYPE i,
         char TYPE c LENGTH 4,
       END OF type.
DATA tab TYPE SORTED TABLE OF type WITH UNIQUE KEY int char.`;
    const identifier = resolveVariable(abap, "tab");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
    const type = identifier!.getType() as Basic.TableType;
    expect(type.isWithHeader()).to.equal(false);
    expect(type.getOptions().primaryKey?.keyFields).to.have.all.members(["INT", "CHAR"]);
  });

  it("type from type group", () => {
    const typegroup = `
TYPES: BEGIN OF abap_componentdescr,
         name TYPE string,
       END OF abap_componentdescr.`;
    const prog = `CONSTANTS c_val TYPE abap_componentdescr-name VALUE 'sdf'.`;
    const type = runMulti(
      [{filename: "abap.type.abap", contents: typegroup},
        {filename: "zfoobar.prog.abap", contents: prog}],
      "c_val");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.StringType);
  });

  it("DECFLOAT", () => {
    const abap = `FIELD-SYMBOLS <moo> TYPE decfloat.`;
    const identifier = resolveVariable(abap, "<moo>");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.DecFloatType);
  });

  it("type from type group, should have qualified name", () => {
    const typegroup = `
TYPES abap_foo TYPE c LENGTH 10.`;
    const prog = `DATA val TYPE abap_foo.`;
    const type = runMulti(
      [{filename: "abap.type.abap", contents: typegroup},
        {filename: "zfoobar.prog.abap", contents: prog}],
      "val");
    expect(type).to.not.equal(undefined);
    expect(type!.getType()).to.be.instanceof(Basic.CharacterType);
    expect(type!.getType().getQualifiedName()).to.equal("abap_foo");
  });

  it("table, LIKE SORTED", () => {
    const abap = `
DATA foo TYPE i.
DATA tab LIKE SORTED TABLE OF foo WITH UNIQUE KEY table_line.`;
    const identifier = resolveVariable(abap, "tab");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
    const type = identifier!.getType() as Basic.TableType;
    expect(type.isWithHeader()).to.equal(false);
    expect(type.getOptions().primaryKey?.isUnique).to.equal(true);
    expect(type.getOptions().primaryKey?.type).to.equal(TableAccessType.sorted);
  });

  it("table, secondary key", () => {
    const abap = `
TYPES: BEGIN OF ty_node,
    name  TYPE string,
    index TYPE i,
  END OF ty_node.
DATA tab TYPE SORTED TABLE OF ty_node
  WITH UNIQUE KEY name
  WITH NON-UNIQUE SORTED KEY array_index COMPONENTS index.`;

    const identifier = resolveVariable(abap, "tab");
    expect(identifier).to.not.equal(undefined);
    expect(identifier?.getType()).to.be.instanceof(Basic.TableType);
    const type = identifier!.getType() as Basic.TableType;

    expect(type.isWithHeader()).to.equal(false);
    expect(type.getOptions().primaryKey?.keyFields).to.have.all.members(["NAME"]);

    const secondary = type.getOptions().secondary;
    expect(secondary?.length).to.equal(1);
    expect(secondary![0].name).to.equal("array_index");
    expect(secondary![0].type).to.equal(TableAccessType.sorted);
    expect(secondary![0].isUnique).to.equal(false);
    expect(secondary![0].keyFields).to.have.all.members(["INDEX"]);
  });

  it("DATA TYPE string", () => {
    const abap = `DATA: BEGIN OF gs_test_data,
    text       TYPE string VALUE 'foo',
    empty_text TYPE string VALUE '',
  END OF gs_test_data.`;
    const identifier = resolveVariable(abap, "gs_test_data");
    expect(identifier).to.not.equal(undefined);
    const obj = identifier?.getValue() as any;
    expect(obj?.text).to.equal("'foo'");
  });

  it("DATA BEGIN, should not have value", () => {
    const abap = `
  DATA: BEGIN OF ms_db,
          foo TYPE string,
        END OF ms_db.`;
    const identifier = resolveVariable(abap, "ms_db");
    expect(identifier).to.not.equal(undefined);
    const obj = identifier?.getValue() as any;
    expect(obj).to.equal(undefined);
  });

  it("table DEFAULT KEY", () => {
    const abap = `
    TYPES: BEGIN OF ts_field,
             name  TYPE string,
             value TYPE string,
           END OF ts_field.
    DATA lt_fields TYPE STANDARD TABLE OF ts_field WITH DEFAULT KEY.`;
    const identifier = resolveVariable(abap, "lt_fields");
    expect(identifier).to.not.equal(undefined);
    const tt = identifier?.getType() as Basic.TableType;
    expect(tt.getOptions().keyType).to.equal(Basic.TableKeyType.default);
  });

  it("table EMPTY KEY", () => {
    const abap = `
    TYPES: BEGIN OF ts_field,
             name  TYPE string,
             value TYPE string,
           END OF ts_field.
    DATA lt_fields TYPE STANDARD TABLE OF ts_field WITH EMPTY KEY.`;
    const identifier = resolveVariable(abap, "lt_fields");
    expect(identifier).to.not.equal(undefined);
    const tt = identifier?.getType() as Basic.TableType;
    expect(tt.getOptions().keyType).to.equal(Basic.TableKeyType.empty);
  });

});
