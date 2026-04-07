import ASTNodeType from '../ASTNodeType';
import TopLevelDeclaration from '../top_level/TopLevelDeclaration';

export default interface TranslationUnit {
    nodeType: ASTNodeType.TRANSLATION_UNIT;
    declarations: TopLevelDeclaration[];
}
