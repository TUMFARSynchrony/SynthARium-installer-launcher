/* eslint-disable jsx-a11y/control-has-associated-label */
import hubLogo from '../../../assets/icons/hub-logo.png';
import help from '../../../assets/icons/help.svg';

function Header() {
  return (
    <div className="mt-4 flex flex-1 grid-cols-3 justify-between px-12 max-h-20">
      <a
        href="https://github.com/TUMFARSynchrony"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src={hubLogo}
          title="Logo"
          className="w-[80px] h-[64px] text-center"
          alt=""
        />
      </a>
      <p className="font-montserrat p-4 px-8 pl-16 text-center text-black text-lg font-bold">
        SynthARium Installer Launcher
      </p>
      <div className="font-montserrat p-4 px-8 text-center text-gray-400 flex gap-2">
        <a
          href="https://github.com/TUMFARSynchrony/SynthARium-installer-launcher"
          target="_blank"
          rel="noreferrer"
        >
          <div className="flex justify-between items-center gap-2">
            <p>Help</p>
            <img src={help} title="Logo" className="w-[16px] h-[16px]" alt="" />
          </div>
        </a>
      </div>
    </div>
  );
}

export default Header;
