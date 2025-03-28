import {ExpressionNode} from "../../nodes";
import {StringType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import * as Expressions from "../../2_statements/expressions";
import {CurrentScope} from "../_current_scope";
import {Source} from "./source";

export class StringTemplate {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): AbstractType {
    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename, new StringType({qualifiedName: "STRING"}));
    }

    return new StringType({qualifiedName: "STRING"});
  }
}