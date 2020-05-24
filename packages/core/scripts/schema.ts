import {IGlobalConfig, IDependency, ISyntaxSettings} from "../src/_config";
import {SevenBitAsciiConf} from "../src/rules/7bit_ascii";
import {AbapdocConf} from "../src/rules/abapdoc";
import {AllowedObjectNamingConf} from "../src/rules/naming/allowed_object_naming";
import {AllowedObjectTypesConf} from "../src/rules/allowed_object_types";
import {AmbiguousStatementConf} from "../src/rules/ambiguous_statement";
import {AvoidUseConf} from "../src/rules/avoid_use";
import {BeginEndNamesConf} from "../src/rules/syntax/begin_end_names";
import {ChainMainlyDeclarationsConf} from "../src/rules/chain_mainly_declarations";
import {CheckAbstractConf} from "../src/rules/check_abstract";
import {CheckCommentsConf} from "../src/rules/check_comments";
import {CheckDDICConf} from "../src/rules/syntax/check_ddic";
import {CheckIncludeConf} from "../src/rules/syntax/check_include";
import {CheckNoHandlerPragmaConf} from "../src/rules/check_no_handler_pragma";
import {CheckSyntaxConf} from "../src/rules/syntax/check_syntax";
import {CheckTextElementsConf} from "../src/rules/check_text_elements";
import {CheckTransformationExistsConf} from "../src/rules/syntax/check_transformation_exists";
import {ClassAttributeNamesConf} from "../src/rules/naming/class_attribute_names";
import {CloudTypesConf} from "../src/rules/cloud_types";
import {ColonMissingSpaceConf} from "../src/rules/whitespace/colon_missing_space";
import {CommentedCodeConf} from "../src/rules/commented_code";
import {ConstructorVisibilityPublicConf} from "../src/rules/constructor_visibility_public";
import {ContainsTabConf} from "../src/rules/whitespace/contains_tab";
import {DefinitionsTopConf} from "../src/rules/definitions_top";
import {DescriptionEmptyConf} from "../src/rules/description_empty";
import {DoubleSpaceConf} from "../src/rules/whitespace/double_space";
import {EmptyLineinStatementConf} from "../src/rules/empty_line_in_statement";
import {EmptyStatementConf} from "../src/rules/empty_statement";
import {EmptyStructureConf} from "../src/rules/empty_structure";
import {ExitOrCheckConf} from "../src/rules/exit_or_check";
import {ExportingConf} from "../src/rules/exporting";
import {ForbiddenIdentifierConf} from "../src/rules/forbidden_identifier";
import {ForbiddenVoidTypeConf} from "../src/rules/forbidden_void_type";
import {FormNoDashConf} from "../src/rules/form_no_dash";
import {FormTablesObsoleteConf} from "../src/rules/form_tables_obsolete";
import {FullyTypeConsantsConf} from "../src/rules/fully_type_constants";
import {FunctionalWritingConf} from "../src/rules/functional_writing";
import {GlobalClassConf} from "../src/rules/syntax/global_class";
import {IdenticalFormNamesConf} from "../src/rules/identical_form_names";
import {IfInIfConf} from "../src/rules/if_in_if";
import {ImplementMethodsConf} from "../src/rules/syntax/implement_methods";
import {InStatementIndentationConf} from "../src/rules/whitespace/in_statement_indentation";
import {IndentationConf} from "../src/rules/whitespace/indentation";
import {InlineDataOldVersionsConf} from "../src/rules/syntax/inline_data_old_versions";
import {KeepSingleParameterCallsOnOneLineConf} from "../src/rules/whitespace/keep_single_parameter_on_one_line";
import {KeywordCaseConf} from "../src/rules/keyword_case";
import {LineLengthConf} from "../src/rules/line_length";
import {LineOnlyPuncConf} from "../src/rules/line_only_punc";
import {LocalClassNamingConf} from "../src/rules/naming/local_class_naming";
import {LocalTestclassLocationConf} from "../src/rules/local_testclass_location";
import {LocalVariableNamesConf} from "../src/rules/naming/local_variable_names";
import {MainFileContentsConf} from "../src/rules/main_file_contents";
import {MaxOneStatementConf} from "../src/rules/max_one_statement";
import {MessageExistsConf} from "../src/rules/message_exists";
import {MethodLengthConf} from "../src/rules/method_length";
import {MethodParameterNamesConf} from "../src/rules/naming/method_parameter_names";
import {MixReturningConf} from "../src/rules/mix_returning";
import {MSAGConsistencyConf} from "../src/rules/msag_consistency";
import {NestingConf} from "../src/rules/nesting";
import {NewlineBetweenMethodsConf} from "../src/rules/whitespace/newline_between_methods";
import {NoPublicAttributesConf} from "../src/rules/no_public_attributes";
import {ObjectNamingConf} from "../src/rules/naming/object_naming";
import {ObsoleteStatementConf} from "../src/rules/obsolete_statement";
import {ParserErrorConf} from "../src/rules/syntax/parser_error";
import {PreferReturningToExportingConf} from "../src/rules/prefer_returning_to_exporting";
import {PreferredCompareOperatorConf} from "../src/rules/preferred_compare_operator";
import {PrefixIsCurrentClassConf} from "../src/rules/prefix_is_current_class";
import {ReleaseIdocConf} from "../src/rules/release_idoc";
import {RemoveDescriptionsConf} from "../src/rules/remove_descriptions";
import {RFCErrorHandlingConf} from "../src/rules/rfc_error_handling";
import {SelectionScreenNamingConf} from "../src/rules/naming/selection_screen_naming";
import {SequentialBlankConf} from "../src/rules/whitespace/sequential_blank";
import {ShortCaseConf} from "../src/rules/short_case";
import {SICFConsistencyConf} from "../src/rules/sicf_consistency";
import {SpaceBeforeColonConf} from "../src/rules/whitespace/space_before_colon";
import {SpaceBeforeDotConf} from "../src/rules/whitespace/space_before_dot";
import {SQLEscapeHostVariablesConf} from "../src/rules/sql_escape_host_variables";
import {StartAtTabConf} from "../src/rules/whitespace/start_at_tab";
import {SuperclassFinalConf} from "../src/rules/syntax/superclass_final";
import {TABLEnhancementCategoryConf} from "../src/rules/tabl_enhancement_category";
import {TryWithoutCatchConf} from "../src/rules/try_without_catch";
import {TypeBeginSingleTypeConf} from "../src/rules/type_begin_single_include";
import {TypeFormParametersConf} from "../src/rules/type_form_parameters";
import {TypesNamingConf} from "../src/rules/naming/types_naming";
import {UnknownTypesConf} from "../src/rules/syntax/unknown_types";
import {UnreachableCodeConf} from "../src/rules/unreachable_code";
import {UnusedVariablesConf} from "../src/rules/unused_variables";
import {UseNewConf} from "../src/rules/use_new";
import {WhenOthersLastConf} from "../src/rules/when_others_last";
import {WhitespaceEndConf} from "../src/rules/whitespace/whitespace_end";
import {XMLConsistencyConf} from "../src/rules/xml_consistency";

export interface IConfig {
  global: IGlobalConfig;
  /** External git dependencies used for syntax checks */
  dependencies?: IDependency[];
  syntax: ISyntaxSettings;
  rules: {
    "7bit_ascii"?: SevenBitAsciiConf | boolean,
    "abapdoc"?: AbapdocConf | boolean,
    "allowed_object_naming"?: AllowedObjectNamingConf | boolean,
    "allowed_object_types"?: AllowedObjectTypesConf | boolean,
    "ambiguous_statement"?: AmbiguousStatementConf | boolean,
    "avoid_use"?: AvoidUseConf | boolean,
    "begin_end_names"?: BeginEndNamesConf | boolean,
    "chain_mainly_declarations"?: ChainMainlyDeclarationsConf | boolean,
    "check_abstract"?: CheckAbstractConf | boolean,
    "check_comments"?: CheckCommentsConf | boolean,
    "check_ddic"?: CheckDDICConf | boolean,
    "check_include"?: CheckIncludeConf | boolean,
    "check_no_handler_pragma"?: CheckNoHandlerPragmaConf | boolean,
    "check_syntax"?: CheckSyntaxConf | boolean,
    "check_text_elements"?: CheckTextElementsConf | boolean,
    "check_transformation_exists"?: CheckTransformationExistsConf | boolean,
    "class_attribute_names"?: ClassAttributeNamesConf | boolean,
    "cloud_types"?: CloudTypesConf | boolean,
    "colon_missing_space"?: ColonMissingSpaceConf | boolean,
    "commented_code"?: CommentedCodeConf | boolean,
    "constructor_visibility_public"?: ConstructorVisibilityPublicConf | boolean,
    "contains_tab"?: ContainsTabConf | boolean,
    "definitions_top"?: DefinitionsTopConf | boolean,
    "description_empty"?: DescriptionEmptyConf | boolean,
    "double_space"?: DoubleSpaceConf | boolean,
    "empty_line_in_statement"?: EmptyLineinStatementConf | boolean,
    "empty_statement"?: EmptyStatementConf | boolean,
    "empty_structure"?: EmptyStructureConf | boolean,
    "exit_or_check"?: ExitOrCheckConf | boolean,
    "exporting"?: ExportingConf | boolean,
    "forbidden_identifier"?: ForbiddenIdentifierConf | boolean,
    "forbidden_void_type"?: ForbiddenVoidTypeConf | boolean,
    "form_no_dash"?: FormNoDashConf | boolean,
    "form_tables_obsolete"?: FormTablesObsoleteConf | boolean,
    "fully_type_constants"?: FullyTypeConsantsConf | boolean,
    "functional_writing"?: FunctionalWritingConf | boolean,
    "global_class"?: GlobalClassConf | boolean,
    "identical_form_names"?: IdenticalFormNamesConf | boolean,
    "if_in_if"?: IfInIfConf | boolean,
    "implement_methods"?: ImplementMethodsConf | boolean,
    "in_statement_indentation"?: InStatementIndentationConf | boolean,
    "indentation"?: IndentationConf | boolean,
    "inline_data_old_versions"?: InlineDataOldVersionsConf | boolean,
    "keep_single_parameter_on_one_line"?: KeepSingleParameterCallsOnOneLineConf | boolean,
    "keyword_case"?: KeywordCaseConf | boolean,
    "line_length"?: LineLengthConf | boolean,
    "line_only_punc"?: LineOnlyPuncConf | boolean,
    "local_class_naming"?: LocalClassNamingConf | boolean,
    "local_testclass_location"?: LocalTestclassLocationConf | boolean,
    "local_variable_names"?: LocalVariableNamesConf | boolean,
    "main_file_contents"?: MainFileContentsConf | boolean,
    "max_one_statement"?: MaxOneStatementConf | boolean,
    "message_exists"?: MessageExistsConf | boolean,
    "method_length"?: MethodLengthConf | boolean,
    "method_parameter_names"?: MethodParameterNamesConf | boolean,
    "mix_returning"?: MixReturningConf | boolean,
    "msag_consistency"?: MSAGConsistencyConf | boolean,
    "nesting"?: NestingConf | boolean,
    "newline_between_methods"?: NewlineBetweenMethodsConf | boolean,
    "no_public_attributes"?: NoPublicAttributesConf | boolean,
    "object_naming"?: ObjectNamingConf | boolean,
    "obsolete_statement"?: ObsoleteStatementConf | boolean,
    "parser_error"?: ParserErrorConf | boolean,
    "prefer_returning_to_exporting"?: PreferReturningToExportingConf | boolean,
    "preferred_compare_operator"?: PreferredCompareOperatorConf | boolean,
    "prefix_is_current_class"?: PrefixIsCurrentClassConf | boolean,
    "release_idoc"?: ReleaseIdocConf | boolean,
    "remove_descriptions"?: RemoveDescriptionsConf | boolean,
    "rfc_error_handling"?: RFCErrorHandlingConf | boolean,
    "selection_screen_naming"?: SelectionScreenNamingConf | boolean,
    "sequential_blank"?: SequentialBlankConf | boolean,
    "short_case"?: ShortCaseConf | boolean,
    "sicf_consistency"?: SICFConsistencyConf | boolean,
    "space_before_colon"?: SpaceBeforeColonConf | boolean,
    "space_before_dot"?: SpaceBeforeDotConf | boolean,
    "sql_escape_host_variables"?: SQLEscapeHostVariablesConf | boolean,
    "start_at_tab"?: StartAtTabConf | boolean,
    "superclass_final"?: SuperclassFinalConf | boolean,
    "tabl_enhancement_category"?: TABLEnhancementCategoryConf | boolean,
    "try_without_catch"?: TryWithoutCatchConf | boolean,
    "type_begin_single_include"?: TypeBeginSingleTypeConf | boolean,
    "type_form_parameters"?: TypeFormParametersConf | boolean,
    "types_naming"?: TypesNamingConf | boolean,
    "unknown_types"?: UnknownTypesConf | boolean,
    "unreachable_code"?: UnreachableCodeConf | boolean,
    "unused_variables"?: UnusedVariablesConf | boolean,
    "use_new"?: UseNewConf | boolean,
    "when_others_last"?: WhenOthersLastConf | boolean,
    "whitespace_end"?: WhitespaceEndConf | boolean,
    "xml_consistency"?: XMLConsistencyConf | boolean,
  };
}
