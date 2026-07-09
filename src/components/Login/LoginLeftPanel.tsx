import React from 'react';

const LoginLeftPanel: React.FC = () => {
  return (
    <div className="hidden lg:landscape:flex flex-col h-screen sticky top-0">
      <div className="h-[55%] w-full">
        <img
          src="/login.png"
          alt="Login illustration"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="h-[45%] bg-gradient-to-br from-[#006fe8] via-[#3158f4] to-[#7b2ff7] flex items-center justify-center px-6 md:px-8 lg:px-[58px]">
        <div className="relative w-full max-w-[470px] bg-[#1c2f8f]/35 backdrop-blur-[1px] p-6 md:p-8 border-l-[7px] border-white">
          <h2 className="text-white text-xl md:text-2xl lg:text-[28px] font-semibold leading-tight mb-3">
            Welcome To Lauratek
          </h2>
          <p className="text-white text-sm md:text-base lg:text-[18px] leading-[1.5] font-medium">
            A powerful platform designed to streamline learning, assessments,
            and student success with a modern, centralized experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginLeftPanel;
