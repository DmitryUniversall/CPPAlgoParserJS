import BaseTopLevelDeclaration from '../BaseTopLevelDeclaration';
import ClassDeclaration from '../../constructions/classes/ClassDeclaration';
import TopLevelDeclarationType from '../TopLevelDeclarationType';

export default interface TopLevelClassDeclaration extends BaseTopLevelDeclaration {
    type: TopLevelDeclarationType.CLASS_DECLARATION;
    declaration: ClassDeclaration;
}
