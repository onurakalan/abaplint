import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import * as Objects from "../../src/objects";
import * as Types from "../../src/abap/types/basic";
import {DataReference, GenericObjectReferenceType, TableAccessType} from "../../src/abap/types/basic";

describe("Table Type, parse XML", () => {

  it("Call parseType", async () => {
    const xml1 = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZAGS_OBJECTS_TT</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <ROWTYPE>ZAGS_OBJECTS</ROWTYPE>
    <ROWKIND>S</ROWKIND>
    <DATATYPE>STRU</DATATYPE>
    <ACCESSMODE>S</ACCESSMODE>
    <KEYDEF>K</KEYDEF>
    <KEYKIND>U</KEYKIND>
    <KEYFDCOUNT>0002</KEYFDCOUNT>
    <DDTEXT>ZAGS_OBJECTS Table Type</DDTEXT>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("zags_objects_tt.ttyp.xml", xml1));
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Objects.TableType;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(Types.TableType);
    const row = (type as Types.TableType).getRowType();
    expect(row).to.be.instanceof(Types.UnknownType);
  });

  it("Call parseType, no ROWTYPE", async () => {
    const xml1 = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZTEST</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>001000</LENG>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <DDTEXT>Hello world</DDTEXT>
    <TYPELEN>001000</TYPELEN>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("ztest.ttyp.xml", xml1));
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Objects.TableType;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(Types.TableType);
    const row = (type as Types.TableType).getRowType();
    expect(row).to.be.instanceof(Types.CharacterType);
  });

  it("Call parseType, no ROWTYPE, no length", async () => {
    const xml1 = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZTEST</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DATATYPE>STRG</DATATYPE>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <DDTEXT>hello world</DDTEXT>
    <TYPELEN>000008</TYPELEN>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("ztest.ttyp.xml", xml1));
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Objects.TableType;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(Types.TableType);
    const row = (type as Types.TableType).getRowType();
    expect(row).to.be.instanceof(Types.StringType);
  });

  it("Call parseType, reference to object", async () => {
    const xml1 = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZTEST</TYPENAME>
    <ROWTYPE>ZCL_FOOBAR</ROWTYPE>
    <ROWKIND>R</ROWKIND>
    <DATATYPE>REF</DATATYPE>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <REFTYPE>C</REFTYPE>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const abap = `CLASS zcl_foobar DEFINITION.
    ENDCLASS.
    CLASS zcl_foobar IMPLEMENTATION.
    ENDCLASS.`;

    const reg = new Registry().addFiles([
      new MemoryFile("ztest.ttyp.xml", xml1),
      new MemoryFile("zcl_foobar.clas.abap", abap),
    ]);
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Objects.TableType;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(Types.TableType);
    const row = (type as Types.TableType).getRowType();
    expect(row).to.be.instanceof(Types.ObjectReferenceType);
  });

  it("string_table, row type should not have qualified name", async () => {
    const xml1 = `
    <?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <DD40V>
        <TYPENAME>STRING_TABLE</TYPENAME>
        <DDLANGUAGE>E</DDLANGUAGE>
        <DATATYPE>STRG</DATATYPE>
        <ACCESSMODE>T</ACCESSMODE>
        <KEYDEF>D</KEYDEF>
        <KEYKIND>N</KEYKIND>
        <DDTEXT>String Table</DDTEXT>
        <TYPELEN>000008</TYPELEN>
       </DD40V>
      </asx:values>
     </asx:abap>
    </abapGit>`;

    const reg = new Registry().addFiles([
      new MemoryFile("string_table.ttyp.xml", xml1),
    ]);
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Objects.TableType;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(Types.TableType);
    const row = (type as Types.TableType).getRowType();
    expect(row.getQualifiedName()).to.equal(undefined);
  });

  it("OBJECT ref type", async () => {
    const xml1 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZTTYPOBJECT</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <ROWTYPE>OBJECT</ROWTYPE>
    <ROWKIND>R</ROWKIND>
    <DATATYPE>REF</DATATYPE>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <DDTEXT>object</DDTEXT>
    <REFTYPE>O</REFTYPE>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFiles([
      new MemoryFile("zttypobject.ttyp.xml", xml1),
    ]);
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Objects.TableType;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(Types.TableType);
    const row = (type as Types.TableType).getRowType();
    expect(row).to.be.instanceof(GenericObjectReferenceType);
  });

  it("DATA ref type", async () => {
    const xml1 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZTTYPDATAREF</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <ROWTYPE>DATA</ROWTYPE>
    <ROWKIND>R</ROWKIND>
    <DATATYPE>REF</DATATYPE>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <DDTEXT>DATA ref</DDTEXT>
    <REFTYPE>D</REFTYPE>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFiles([
      new MemoryFile("zttypdataref.ttyp.xml", xml1),
    ]);
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Objects.TableType;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(Types.TableType);
    const row = (type as Types.TableType).getRowType();
    expect(row).to.be.instanceof(DataReference);
  });

  it("secondary non-unique sorted key", async () => {
    const xml1 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZTTYP</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <ROWTYPE>ZSTRU</ROWTYPE>
    <ROWKIND>S</ROWKIND>
    <DATATYPE>STRU</DATATYPE>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <KEYFDCOUNT>0001</KEYFDCOUNT>
    <DDTEXT>test</DDTEXT>
   </DD40V>
   <DD42V>
    <DD42V>
     <TYPENAME>ZTTYP</TYPENAME>
     <SECKEYNAME>KEYNAME</SECKEYNAME>
     <KEYFDPOS>0001</KEYFDPOS>
     <ROWTYPEPOS>0001</ROWTYPEPOS>
     <KEYFIELD>FIELD1</KEYFIELD>
    </DD42V>
   </DD42V>
   <DD43V>
    <DD43V>
     <TYPENAME>ZTTYP</TYPENAME>
     <SECKEYNAME>KEYNAME</SECKEYNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <ACCESSMODE>S</ACCESSMODE>
     <KIND>K</KIND>
     <KEYDESCRIPTION>description</KEYDESCRIPTION>
    </DD43V>
   </DD43V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const xml2 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZSTRU</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>INTTAB</TABCLASS>
    <DDTEXT>test</DDTEXT>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>FIELD1</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>X</INTTYPE>
     <INTLEN>000004</INTLEN>
     <DATATYPE>INT4</DATATYPE>
     <LENG>000010</LENG>
     <MASK>  INT4</MASK>
    </DD03P>
    <DD03P>
     <FIELDNAME>FIELD2</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>X</INTTYPE>
     <INTLEN>000004</INTLEN>
     <DATATYPE>INT4</DATATYPE>
     <LENG>000010</LENG>
     <MASK>  INT4</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFiles([
      new MemoryFile("zttyp.ttyp.xml", xml1),
      new MemoryFile("zstru.tabl.xml", xml2),
    ]);
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Objects.TableType;

    const type = tabl.parseType(reg) as Types.TableType | undefined;
    expect(type).to.be.instanceof(Types.TableType);
    const secondary = type?.getOptions().secondary;
    expect(secondary).to.not.equal(undefined);
    expect(secondary!.length).to.equal(1);

    expect(secondary![0].isUnique).to.equal(false);
    expect(secondary![0].keyFields[0]).to.equal("FIELD1");
    expect(secondary![0].name).to.equal("KEYNAME");
    expect(secondary![0].type).to.equal(TableAccessType.sorted);
  });

});