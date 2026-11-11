import Image from "next/image";

export function Brand() {
  return (
    <span className="wordmark">
      <Image
        className="dark:hidden"
        src="/logo-light.png"
        alt=""
        width={26}
        height={26}
        priority
      />
      <Image
        className="hidden dark:block"
        src="/logo-dark.png"
        alt=""
        width={26}
        height={26}
        priority
      />{" "}
      PanelUI <span className="brand-platform">Taro</span>
    </span>
  );
}
