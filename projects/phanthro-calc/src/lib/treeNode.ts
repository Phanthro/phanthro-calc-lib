export class TreeNode {
    public left: TreeNode | null;
    public right: TreeNode | null;

    constructor(public value: string | number) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}
