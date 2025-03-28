import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {DataReference, GenericObjectReferenceType, ObjectReferenceType, UnknownType, VoidType} from "../../types/basic";
import * as Expressions from "../../2_statements/expressions";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Source} from "./source";
import {TypeUtils} from "../_type_utils";
import {BasicTypes} from "../basic_types";

export class Cast {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, targetType: AbstractType | undefined, filename: string): AbstractType {
    const sourceNode = node.findDirectExpression(Expressions.Source);
    if (sourceNode === undefined) {
      throw new Error("Cast, source node not found");
    }

    const sourceType = new Source().runSyntax(sourceNode, scope, filename);
    let tt: AbstractType | undefined = undefined;

    const typeExpression = node.findDirectExpression(Expressions.TypeNameOrInfer);
    const typeName = typeExpression?.concatTokens();
    if (typeName === undefined) {
      throw new Error("Cast, child TypeNameOrInfer not found");
    } else if (typeName === "#" && targetType) {
      tt = targetType;
    } else if (typeName === "#") {
      throw new Error("Cast, todo, infer type");
    }

    if (tt === undefined && typeExpression) {
      const basic = new BasicTypes(filename, scope);
      tt = basic.parseType(typeExpression);
      if (tt === undefined || tt instanceof VoidType || tt instanceof UnknownType) {
        const found = scope.findObjectDefinition(typeName);
        if (found) {
          tt = new ObjectReferenceType(found, typeName);
        }
      } else {
        tt = new DataReference(tt, typeName);
      }
      if (tt === undefined && scope.getDDIC().inErrorNamespace(typeName) === false) {
        tt = new VoidType(typeName);
      } else if (typeName.toUpperCase() === "OBJECT") {
        return new GenericObjectReferenceType();
      } else if (tt === undefined) {
        // todo, this should be an UnknownType instead?
        throw new Error("Type \"" + typeName + "\" not found in scope, Cast");
      }
    }
    new Source().addIfInferred(node, scope, filename, tt);

    if (new TypeUtils(scope).isCastable(sourceType, tt) === false) {
      throw new Error("Cast, incompatible types");
    }

    return tt!;
  }
}