import { ObjectOmit } from 'typelevel-ts'; // Thanks @gcanti, we <3 you all!

declare module 'mobx-react' {
  export function inject<D>(
    mapStoreToProps: (store: any) => D
  ): <A extends D>(
    component: React.ComponentType<A>
  ) => React.SFC<ObjectOmit<A, keyof D> & Partial<D>>;
}

/* SystemJS module definition */
declare let nodeModule: NodeModule;
interface NodeModule {
  id: string;
}

declare let window: Window;
declare let Window: {
  prototype: Window;
  new (): Window;
};

declare module 'yup';
