const user = {
  name: "Brandon Uriel",
  surname: "Garcia Ramos",
  email: "bugr.2487@gmail.com",
  role: "Student",
};

const ProfilePage = () => {
  return (
    <>
      <div className="container mx-auto mt-10">
        <div>
          <div className="px-4 sm:px-0">
            <h3 className="text-base font-semibold leading-7 text-gray-900">
              Tu perfíl
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              Es un placer tenerte en Cursumi.
            </p>
          </div>
          <div className="mt-6">
            <dl className="grid grid-cols-1 sm:grid-cols-3">
              <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Nombre Completo
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
                  {user.name} {user.surname}
                </dd>
              </div>
              <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Correo eletrónico
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
                  {user.email}
                </dd>
              </div>
              <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Role
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
                  {user.role}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
